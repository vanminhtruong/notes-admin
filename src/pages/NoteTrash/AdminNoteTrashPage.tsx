import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Trash2, Search, CalendarClock, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '@/services/adminService';
import Pagination from '@/components/common/Pagination';
import { hasPermission } from '@utils/auth';

type TrashItem = { id: number; originalNoteId: number; title: string; userId: number; deletedById: number|null; deletedAt: string; expiresAt: string };
type Response = { notes: TrashItem[]; pagination: { total: number; page: number; totalPages: number } };

const dictionary: Record<string, Record<string,string>> = {
 vi: { title:'Thùng rác ghi chú', subtitle:'Quản lý ghi chú đã xóa của người dùng. Tự động xóa vĩnh viễn sau 30 ngày.', search:'Tìm theo tiêu đề...', user:'Lọc theo User ID', all:'Tất cả người dùng', empty:'Không có ghi chú nào trong thùng rác', note:'Ghi chú', owner:'Người sở hữu', deleted:'Ngày xóa', expiry:'Hạn xóa', action:'Thao tác', restore:'Khôi phục', remove:'Xóa vĩnh viễn', selected:'Xóa đã chọn', clear:'Dọn sạch thùng rác', confirmOne:'Xóa vĩnh viễn ghi chú này?', confirmMany:'Xóa vĩnh viễn ghi chú đã chọn?', confirmAll:'Xóa toàn bộ ghi chú đang nằm trong thùng rác của phạm vi được chọn?', success:'Thao tác thành công', error:'Không thể xử lý thùng rác', previous:'Trước', next:'Sau' },
 en: { title:'Note trash',subtitle:'Manage deleted user notes. Items are permanently removed after 30 days.',search:'Search by title...',user:'Filter User ID',all:'All users',empty:'No deleted notes',note:'Note',owner:'Owner',deleted:'Deleted',expiry:'Expires',action:'Actions',restore:'Restore',remove:'Delete forever',selected:'Delete selected',clear:'Empty trash',confirmOne:'Permanently delete this note?',confirmMany:'Permanently delete selected notes?',confirmAll:'Permanently delete all notes in the selected scope?',success:'Completed',error:'Trash operation failed',previous:'Previous',next:'Next' },
 ko: {title:'메모 휴지통',subtitle:'30일 후 자동으로 삭제되는 메모 관리',search:'제목 검색...',user:'사용자 ID',all:'전체 사용자',empty:'삭제된 메모 없음',note:'메모',owner:'소유자',deleted:'삭제일',expiry:'만료일',action:'작업',restore:'복원',remove:'영구 삭제',selected:'선택 삭제',clear:'휴지통 비우기',confirmOne:'영구 삭제?',confirmMany:'선택 삭제?',confirmAll:'휴지통 비우기?',success:'완료',error:'오류',previous:'이전',next:'다음'},
 'zh-CN': {title:'笔记回收站',subtitle:'管理已删除的笔记，30天后自动清除',search:'搜索标题...',user:'用户ID',all:'所有用户',empty:'回收站为空',note:'笔记',owner:'所有者',deleted:'删除时间',expiry:'到期时间',action:'操作',restore:'恢复',remove:'永久删除',selected:'删除选中项',clear:'清空回收站',confirmOne:'永久删除？',confirmMany:'删除所选笔记？',confirmAll:'清空回收站？',success:'已完成',error:'操作失败',previous:'上一页',next:'下一页'},
 'zh-TW': {title:'筆記回收桶',subtitle:'管理已刪除的筆記，30天後自動清除',search:'搜尋標題...',user:'使用者ID',all:'所有使用者',empty:'回收桶為空',note:'筆記',owner:'擁有者',deleted:'刪除時間',expiry:'到期時間',action:'操作',restore:'還原',remove:'永久刪除',selected:'刪除選中項',clear:'清空回收桶',confirmOne:'永久刪除？',confirmMany:'刪除所選筆記？',confirmAll:'清空回收桶？',success:'已完成',error:'操作失敗',previous:'上一頁',next:'下一頁'},
};

export default function AdminNoteTrashPage() {
 const { i18n }=useTranslation();
 const lang=i18n.resolvedLanguage||i18n.language;
 const t=dictionary[lang]||dictionary[lang.split('-')[0]]||dictionary.vi;
 const canRestore=hasPermission('manage_notes.create');
 const canDelete=hasPermission('manage_notes.delete');
 const [page,setPage]=useState(1);
 const [search,setSearch]=useState('');
 const [userId,setUserId]=useState('');
 const [items,setItems]=useState<TrashItem[]>([]);
 const [count,setCount]=useState(0);
 const [pages,setPages]=useState(1);
 const [selected,setSelected]=useState<number[]>([]);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);

 const load=useCallback(async()=>{
   setLoading(true);
   try {
     const data=await adminService.getNoteTrash({page,limit:20,search,userId:userId||undefined}) as unknown as Response;
     setItems(data.notes);setCount(data.pagination.total);setPages(Math.max(1,data.pagination.totalPages));setSelected([]);
     if(page>1&&!data.notes.length)setPage(page-1);
   } catch(e){toast.error(e instanceof Error?e.message:t.error);}
   finally{setLoading(false);}
 },[page,search,userId,t.error]);
 useEffect(()=>{void load();},[load]);
 const act=async(operation:()=>Promise<unknown>,confirm?:string)=>{
   if(confirm&&!window.confirm(confirm))return;
   setBusy(true);
   try{await operation();toast.success(t.success);await load();}
   catch(e){toast.error(e instanceof Error?e.message:t.error);}
   finally{setBusy(false);}
 };
 const date=(v:string)=>new Date(v).toLocaleString(lang);
 const button='inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
 return <main className="space-y-5 p-3 sm:p-5">
  <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
   <div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><Trash2 size={24}/></div><div><h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.title}</h1><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t.subtitle}</p></div></div>
   {canDelete&&<button disabled={busy||!count} className={button+' border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'} onClick={()=>void act(()=>adminService.emptyNoteTrash(userId?Number(userId):undefined),t.confirmAll)}><Trash2 size={16}/>{t.clear}</button>}
  </header>
  <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
   <div className="flex flex-wrap items-end gap-3">
    <label className="min-w-48 flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">{t.search}<div className="relative mt-1"><Search size={16} className="absolute left-3 top-3 text-gray-400"/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder={t.search} className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2 text-gray-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"/></div></label>
    <label className="w-full text-sm font-medium text-gray-700 dark:text-gray-200 sm:w-48">{t.user}<input type="number" min="1" value={userId} onChange={e=>{setUserId(e.target.value);setPage(1)}} placeholder={t.all} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"/></label>
    {canDelete&&selected.length>0&&<button disabled={busy} className={button+' border-red-200 text-red-700 dark:border-red-800 dark:text-red-300'} onClick={()=>void act(()=>adminService.deleteSelectedTrashedNotes(selected),t.confirmMany)}><Trash2 size={16}/>{t.selected} ({selected.length})</button>}
   </div>
  </section>
  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
   {loading?<div className="flex justify-center p-16 text-indigo-500"><LoaderCircle size={30} className="animate-spin"/></div>:!items.length?<div className="py-16 text-center text-gray-500 dark:text-gray-300"><Trash2 size={36} className="mx-auto mb-3 opacity-60"/>{t.empty}</div>:
    <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm">
    <thead className="bg-gray-50 text-gray-600 dark:bg-neutral-800 dark:text-gray-200"><tr>
      <th className="p-3">{canDelete&&<input type="checkbox" aria-label="Select all" checked={items.every(x=>selected.includes(x.id))} onChange={e=>setSelected(e.target.checked?items.map(x=>x.id):[])}/>}</th>
      <th className="p-3">{t.note}</th><th className="p-3">{t.owner}</th><th className="p-3">{t.deleted}</th><th className="p-3">{t.expiry}</th><th className="p-3">{t.action}</th>
    </tr></thead>
    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">{items.map(item=><tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
      <td className="p-3">{canDelete&&<input type="checkbox" aria-label={'Select '+item.title} checked={selected.includes(item.id)} onChange={e=>setSelected(prev=>e.target.checked?[...prev,item.id]:prev.filter(id=>id!==item.id))}/>}</td>
      <td className="max-w-60 break-words p-3 font-semibold text-gray-900 dark:text-white">{item.title}</td>
      <td className="p-3 text-gray-600 dark:text-gray-300">#{item.userId}</td><td className="p-3 text-gray-600 dark:text-gray-300">{date(item.deletedAt)}</td>
      <td className="p-3 text-amber-700 dark:text-amber-300"><span className="inline-flex items-center gap-1"><CalendarClock size={14}/>{date(item.expiresAt)}</span></td>
      <td className="p-3"><div className="flex gap-2">{canRestore&&<button disabled={busy} className={button+' border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300'} onClick={()=>void act(()=>adminService.restoreTrashedNote(item.id))}><RotateCcw size={15}/>{t.restore}</button>}{canDelete&&<button disabled={busy} className={button+' border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300'} onClick={()=>void act(()=>adminService.deleteTrashedNote(item.id),t.confirmOne)}><Trash2 size={15}/>{t.remove}</button>}</div></td>
    </tr>)}</tbody></table></div>}
  </section>
  {pages>1&&!loading&&<div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700"><Pagination currentPage={page} totalPages={pages} onPageChange={(nextPage)=>{if(!busy&&nextPage>=1&&nextPage<=pages)setPage(nextPage);}} totalItems={count} itemsPerPage={20}/></div>}
 </main>;
}
