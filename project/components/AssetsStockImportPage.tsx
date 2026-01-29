import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle2, Trash2, Download, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_PROJECTS } from '../constants';
import { AuditLog, Project, UserRole } from '../types';
import { BUILDINGS_STORAGE_KEY, getStoredBuildings, setStoredBuildings } from '../utils/assetDigitalSync';
import { ROOMS_STORAGE_KEY, getStoredRooms, setStoredRooms } from '../utils/assetRoomSync';

type ImportTab = 'buildings' | 'rooms';

type ImportMode = 'new_only';

type BuildingRow = {
  code: string;
  name: string;
  location?: string;
  value?: number;
  completionDate?: string;
  floorCount?: number;
};

type RoomRow = {
  buildingCode?: string;
  buildingName: string;
  roomNo: string;
  floor?: number;
  area?: number;
  type?: string;
  status?: string;
  department?: string;
};

type RowError = {
  rowIndex: number; // 1-based data row (excluding header)
  message: string;
};

function normalizeHeader(h: any) {
  return String(h ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase();
}

function parseNumber(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseDateYMD(v: any): string | undefined {
  if (!v) return undefined;
  if (v instanceof Date) {
    const d = v;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
  const s = String(v).trim();
  // allow yyyy-mm-dd / yyyy/mm/dd
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const y = m[1];
    const mm = String(Number(m[2])).padStart(2, '0');
    const dd = String(Number(m[3])).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }
  return undefined;
}

function buildAuditLog(userRole: UserRole, action: AuditLog['action'], entityType: AuditLog['entityType'], entityId: string, entityName: string, changedFields?: Record<string, { old: any; new: any }>): AuditLog {
  return {
    id: `LOG-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    action,
    entityType,
    entityId,
    entityName,
    changedFields,
    operator: '当前用户',
    operatorRole: userRole,
    timestamp: new Date().toISOString(),
  };
}

const AssetsStockImportPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [, setProjects] = useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS);
  const [, setAuditLogs] = useLocalStorage<AuditLog[]>('uniassets-audit-logs', []);

  const [tab, setTab] = useState<ImportTab>('buildings');
  const [importMode] = useState<ImportMode>('new_only');

  const [fileName, setFileName] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [rawRows, setRawRows] = useState<any[]>([]);

  const [buildingRows, setBuildingRows] = useState<BuildingRow[]>([]);
  const [roomRows, setRoomRows] = useState<RoomRow[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);

  const resetAll = () => {
    setFileName('');
    setSheetNames([]);
    setSelectedSheet('');
    setRawRows([]);
    setBuildingRows([]);
    setRoomRows([]);
    setErrors([]);
  };

  const templateHint = useMemo(() => {
    return {
      buildings: {
        title: '楼宇导入模板（推荐表头）',
        cols: [
          '楼宇编码(必填) / BuildingCode',
          '楼宇名称(必填) / BuildingName',
          '建设地点 / Location',
          '价值(元) / Value',
          '竣工日期(YYYY-MM-DD) / CompletionDate',
          '楼层数 / FloorCount',
        ],
      },
      rooms: {
        title: '房间导入模板（推荐表头）',
        cols: [
          '楼宇编码(可选) / BuildingCode',
          '楼宇名称(必填) / BuildingName',
          '房间号(必填) / RoomNo',
          '楼层 / Floor',
          '面积(㎡) / Area',
          '房间类型(Admin/Teaching/Lab/Student/Commercial/Logistics) / Type',
          '状态(Empty/Occupied) / Status',
          '使用部门 / Department',
        ],
      },
    };
  }, []);

  const parseCurrentSheet = (rows: any[]) => {
    const nextErrors: RowError[] = [];

    if (!rows || rows.length === 0) {
      setBuildingRows([]);
      setRoomRows([]);
      setErrors([{ rowIndex: 0, message: 'Sheet 为空或无法解析。' }]);
      return;
    }

    // Normalize keys
    const normalized = rows.map(r => {
      const out: Record<string, any> = {};
      Object.entries(r || {}).forEach(([k, v]) => {
        out[normalizeHeader(k)] = v;
      });
      return out;
    });

    // Header aliases
    const bAlias: Record<string, keyof BuildingRow> = {
      buildingcode: 'code',
      code: 'code',
      楼宇编码: 'code' as any,
      楼栋编码: 'code' as any,
      编码: 'code' as any,

      buildingname: 'name',
      name: 'name',
      楼宇名称: 'name' as any,
      楼栋名称: 'name' as any,
      建筑名称: 'name' as any,

      location: 'location',
      建设地点: 'location' as any,
      地点: 'location' as any,
      地址: 'location' as any,

      value: 'value',
      价值: 'value' as any,
      原值: 'value' as any,
      金额: 'value' as any,

      completiondate: 'completionDate',
      竣工日期: 'completionDate' as any,
      完工日期: 'completionDate' as any,

      floorcount: 'floorCount',
      楼层数: 'floorCount' as any,
      层数: 'floorCount' as any,
    };

    const rAlias: Record<string, keyof RoomRow> = {
      buildingcode: 'buildingCode',
      楼宇编码: 'buildingCode' as any,
      楼栋编码: 'buildingCode' as any,

      buildingname: 'buildingName',
      楼宇名称: 'buildingName' as any,
      楼栋名称: 'buildingName' as any,

      roomno: 'roomNo',
      房间号: 'roomNo' as any,
      房号: 'roomNo' as any,

      floor: 'floor',
      楼层: 'floor' as any,

      area: 'area',
      面积: 'area' as any,
      "面积㎡": 'area' as any,

      type: 'type',
      房间类型: 'type' as any,
      用途: 'type' as any,

      status: 'status',
      状态: 'status' as any,

      department: 'department',
      使用部门: 'department' as any,
      部门: 'department' as any,
    };

    if (tab === 'buildings') {
      const out: BuildingRow[] = normalized.map((r, idx) => {
        const mapped: any = {};
        Object.entries(r).forEach(([k, v]) => {
          const key = bAlias[k] || (bAlias[normalizeHeader(k)] as any);
          if (key) mapped[key] = v;
        });
        const code = String(mapped.code || '').trim();
        const name = String(mapped.name || '').trim();

        if (!code) nextErrors.push({ rowIndex: idx + 1, message: '楼宇编码为空' });
        if (!name) nextErrors.push({ rowIndex: idx + 1, message: '楼宇名称为空' });

        const completionDate = parseDateYMD(mapped.completionDate);
        if (mapped.completionDate && !completionDate) {
          nextErrors.push({ rowIndex: idx + 1, message: '竣工日期格式不合法（建议 YYYY-MM-DD）' });
        }

        return {
          code,
          name,
          location: mapped.location ? String(mapped.location).trim() : undefined,
          value: parseNumber(mapped.value),
          completionDate,
          floorCount: parseNumber(mapped.floorCount),
        };
      });

      // duplicate check in file
      const seen = new Set<string>();
      out.forEach((r, idx) => {
        if (!r.code) return;
        if (seen.has(r.code)) {
          nextErrors.push({ rowIndex: idx + 1, message: `Excel 内楼宇编码重复：${r.code}` });
        }
        seen.add(r.code);
      });

      setBuildingRows(out);
      setRoomRows([]);
      setErrors(nextErrors);
      return;
    }

    // rooms
    const out: RoomRow[] = normalized.map((r, idx) => {
      const mapped: any = {};
      Object.entries(r).forEach(([k, v]) => {
        const key = rAlias[k] || (rAlias[normalizeHeader(k)] as any);
        if (key) mapped[key] = v;
      });

      const buildingName = String(mapped.buildingName || '').trim();
      const buildingCode = mapped.buildingCode ? String(mapped.buildingCode).trim() : undefined;
      const roomNo = String(mapped.roomNo || '').trim();

      if (!buildingName) nextErrors.push({ rowIndex: idx + 1, message: '楼宇名称为空' });
      if (!roomNo) nextErrors.push({ rowIndex: idx + 1, message: '房间号为空' });

      const floor = parseNumber(mapped.floor);
      const area = parseNumber(mapped.area);

      return {
        buildingCode,
        buildingName,
        roomNo,
        floor: floor !== undefined ? Number(floor) : undefined,
        area: area !== undefined ? Number(area) : undefined,
        type: mapped.type ? String(mapped.type).trim() : undefined,
        status: mapped.status ? String(mapped.status).trim() : undefined,
        department: mapped.department ? String(mapped.department).trim() : undefined,
      };
    });

    const key = (r: RoomRow) => `${r.buildingCode || r.buildingName}::${r.roomNo}`;
    const seen = new Set<string>();
    out.forEach((r, idx) => {
      if (!r.roomNo) return;
      const k = key(r);
      if (seen.has(k)) nextErrors.push({ rowIndex: idx + 1, message: `Excel 内房间重复：${k}` });
      seen.add(k);
    });

    setRoomRows(out);
    setBuildingRows([]);
    setErrors(nextErrors);
  };

  const handleFile = async (file: File) => {
    resetAll();
    setFileName(file.name);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    const names = workbook.SheetNames || [];
    setSheetNames(names);

    const initialSheet = names[0] || '';
    setSelectedSheet(initialSheet);

    if (!initialSheet) {
      setErrors([{ rowIndex: 0, message: '未找到可用 Sheet。' }]);
      return;
    }

    const sheet = workbook.Sheets[initialSheet];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    setRawRows(rows as any[]);
    parseCurrentSheet(rows as any[]);
  };

  const handleChangeSheet = (sheetName: string) => {
    setSelectedSheet(sheetName);
    // re-parse from rawRows if already loaded via first sheet? We need full workbook to parse others.
    // Simple approach: require re-upload to change sheet; but we can keep workbook in memory via state.
  };

  const canImport = errors.length === 0 && ((tab === 'buildings' && buildingRows.length > 0) || (tab === 'rooms' && roomRows.length > 0));

  const doImport = () => {
    if (!canImport) return;

    const auditBatch: AuditLog[] = [];

    if (tab === 'buildings') {
      const existing = getStoredBuildings();
      const existingCodeSet = new Set(existing.map((b: any) => String(b.code || '').trim()).filter(Boolean));

      const toAdd = buildingRows
        .filter(r => r.code && !existingCodeSet.has(r.code))
        .map(r => {
          const id = `BLD-${r.code}`;
          const value = r.value ?? 0;
          return {
            id,
            name: r.name,
            code: r.code,
            location: r.location || '-',
            structure: 'Frame',
            value,
            status: 'TitleDeed',
            completionDate: r.completionDate,
            hasCad: false,
            floorCount: r.floorCount || 0,
            sourceProjectId: undefined,
          } as any;
        });

      if (toAdd.length > 0) {
        setStoredBuildings([...toAdd, ...existing]);
      }

      auditBatch.push(
        buildAuditLog(userRole, 'create', 'project', `IMPORT-${Date.now()}`, '存量房产导入-楼宇', {
          buildings: { old: 0, new: toAdd.length },
          mode: { old: '', new: importMode },
          storageKey: { old: '', new: BUILDINGS_STORAGE_KEY },
        })
      );

      alert(`导入完成：新增楼宇 ${toAdd.length} 条（已存在跳过）。`);
    }

    if (tab === 'rooms') {
      const existing = getStoredRooms();
      const existingKeySet = new Set(existing.map((r: any) => `${String(r.buildingName || '').trim()}::${String(r.roomNo || '').trim()}`));

      const toAdd = roomRows
        .filter(r => r.buildingName && r.roomNo)
        .filter(r => !existingKeySet.has(`${r.buildingName}::${r.roomNo}`))
        .map(r => {
          const id = `RM-IMPORT-${r.buildingName}-${r.roomNo}`;
          return {
            id,
            roomNo: r.roomNo,
            buildingName: r.buildingName,
            area: r.area || 0,
            type: (r.type as any) || 'Admin',
            status: (r.status as any) || 'Empty',
            department: r.department || '',
            floor: r.floor || (Number(String(r.roomNo).slice(0, 1)) || 1),
            sourceProjectId: undefined,
            functionMain: undefined,
            functionSub: undefined,
          } as any;
        });

      if (toAdd.length > 0) {
        setStoredRooms([...toAdd, ...existing]);
      }

      auditBatch.push(
        buildAuditLog(userRole, 'create', 'project', `IMPORT-${Date.now()}`, '存量房产导入-房间', {
          rooms: { old: 0, new: toAdd.length },
          mode: { old: '', new: importMode },
          storageKey: { old: '', new: ROOMS_STORAGE_KEY },
        })
      );

      alert(`导入完成：新增房间 ${toAdd.length} 条（已存在跳过）。`);
    }

    if (auditBatch.length > 0) {
      setAuditLogs(prev => [...auditBatch, ...prev].slice(0, 1000));
    }

    // Ensure projects localStorage hook is touched to avoid unused import; no-op
    setProjects(prev => prev);
  };

  const previewRows = tab === 'buildings' ? buildingRows : roomRows;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329] flex items-center gap-2">
          <FileSpreadsheet size={22} /> 存量房产导入（Excel）
        </h2>
        <p className="text-[#646a73]">支持导入楼宇与房间台账。导入策略：仅新增，重复跳过。</p>
      </div>

      <div className="bg-white border border-[#dee0e3] rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setTab('buildings');
              setBuildingRows([]);
              setRoomRows([]);
              setErrors([]);
            }}
            className={`px-3 py-2 rounded-md text-sm border ${tab === 'buildings' ? 'border-[#3370ff] text-[#3370ff] bg-[#e1eaff]' : 'border-[#dee0e3] text-[#646a73] hover:bg-[#f2f3f5]'}`}
          >
            楼宇导入
          </button>
          <button
            onClick={() => {
              setTab('rooms');
              setBuildingRows([]);
              setRoomRows([]);
              setErrors([]);
            }}
            className={`px-3 py-2 rounded-md text-sm border ${tab === 'rooms' ? 'border-[#3370ff] text-[#3370ff] bg-[#e1eaff]' : 'border-[#dee0e3] text-[#646a73] hover:bg-[#f2f3f5]'}`}
          >
            房间导入
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#dee0e3] rounded-md text-sm cursor-pointer hover:bg-[#f2f3f5]">
            <Upload size={16} /> 选择 Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
          </label>

          {fileName && (
            <div className="text-sm text-[#646a73] flex-1 truncate">已选择：{fileName}</div>
          )}

          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 px-3 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-[#f2f3f5]"
            type="button"
          >
            <Trash2 size={16} /> 重置
          </button>
        </div>

        <div className="bg-[#f9fafb] border border-[#dee0e3] rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[#1f2329]">
            <Info size={16} /> {templateHint[tab].title}
          </div>
          <div className="mt-2 grid gap-1 text-xs text-[#646a73]">
            {templateHint[tab].cols.map(c => (
              <div key={c}>{c}</div>
            ))}
          </div>
          <div className="mt-3 text-xs text-[#8f959e]">提示：你可以使用英文表头（如 BuildingCode/RoomNo），也可用中文表头（如 楼宇编码/房间号）。</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-[#8f959e]">当前落库：楼宇 {BUILDINGS_STORAGE_KEY} / 房间 {ROOMS_STORAGE_KEY}</div>
          <button
            type="button"
            onClick={doImport}
            disabled={!canImport}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${canImport ? 'bg-[#3370ff] text-white hover:bg-[#285cc9]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            <CheckCircle2 size={16} /> 确认导入
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 font-medium">
            <AlertCircle size={18} /> 校验错误（{errors.length}）
          </div>
          <div className="mt-2 text-sm text-red-700 space-y-1 max-h-56 overflow-auto">
            {errors.slice(0, 100).map((e, idx) => (
              <div key={`${e.rowIndex}-${idx}`}>第 {e.rowIndex} 行：{e.message}</div>
            ))}
            {errors.length > 100 && <div>仅展示前 100 条错误</div>}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#dee0e3] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#dee0e3] flex items-center justify-between">
          <div className="font-semibold text-[#1f2329]">数据预览</div>
          <div className="text-xs text-[#8f959e]">共 {previewRows.length} 行（展示前 50 行）</div>
        </div>
        <div className="p-4 overflow-auto">
          {previewRows.length === 0 ? (
            <div className="text-center text-[#8f959e] py-10">请先选择 Excel 文件并解析。</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-[#f5f6f7] text-[#646a73]">
                <tr>
                  {Object.keys(previewRows[0] as any).map(k => (
                    <th key={k} className="px-3 py-2 text-left whitespace-nowrap">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee0e3]">
                {(previewRows as any[]).slice(0, 50).map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#f9fafb]">
                    {Object.keys(previewRows[0] as any).map(k => (
                      <td key={k} className="px-3 py-2 whitespace-nowrap">{String((r as any)[k] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="text-xs text-[#8f959e]">
        说明：本模块仅做 Excel 导入与本地落库（localStorage）。重复数据将跳过，不覆盖。
      </div>
    </div>
  );
};

export default AssetsStockImportPage;

