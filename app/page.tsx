"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Atom, 
  Microscope, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ClipboardList,
  User,
  X,
  ShieldCheck,
  Printer,
  Trash2,
  ShieldAlert,
  RotateCcw,
  PackagePlus,
  Sparkles,
  FolderPlus,
  Lock,
  LogOut,
  UserCheck,
  KeyRound,
  Edit3
} from "lucide-react";

type ItemNature = "consumable" | "returnable";

interface LabItem {
  id: string;
  name: string;
  subject: "الكيمياء" | "الفيزياء" | "الأحياء" | "العلوم العامة";
  category: "مواد كيميائية وأحماض" | "أدوات زجاجية" | "أجهزة ومعدات" | "نماذج ومجسمات";
  nature: ItemNature;
  currentStock: number;
  minLimit: number;
  unit: string;
  location: string;
}

interface RequestedItemEntry {
  itemId: string;
  itemName: string;
  category: string;
  nature: ItemNature;
  quantity: number;
  unit: string;
}

interface ProcurementItem {
  name: string;
  quantity: string;
  providedBy: "أمين المختبر / المدرسة" | "المعلم" | "الطلاب";
}

interface PrepRequest {
  id: string;
  teacherName: string;
  labTechnician: string;
  subject: string;
  grade: string;
  track: string;
  section: string;
  academicYear: string;
  semester: string;
  experimentTitle: string;
  date: string;
  period: string;
  items: RequestedItemEntry[];
  procurements: ProcurementItem[];
}

interface BreakageRecord {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  subject: "الكيمياء" | "الفيزياء" | "الأحياء" | "العلوم العامة";
  quantity: number;
  brokenBy: string;
  reason: string;
  teacherName: string;
}

interface OperationalPlanItem {
  id: string;
  academicYear: string;
  semester: string;
  weekNumber: number;
  day: "السبت" | "الأحد" | "الإثنين" | "الثلاثاء" | "الأربعاء" | "الخميس" | "الجمعة";
  period: string;
  subject: "الكيمياء" | "الفيزياء" | "الأحياء" | "العلوم العامة";
  grade: string;
  track: string;
  section: string;
  teacherName: string;
  labTechnician: string;
  experimentTitle: string;
  labRoom: string;
  status: "مجدولة" | "تم التنفيذ" | "مؤجلة";
}

const GRADES_LIST = ["الصف 5", "الصف 6", "الصف 7", "الصف 8", "الصف 9", "الصف 10", "الصف 11", "الصف 12"];
const PERIODS_LIST = ["الحصة الأولى", "الحصة الثانية", "الحصة الثالثة", "الحصة الرابعة", "الحصة الخامسة", "الحصة السادسة", "الحصة السابعة", "الحصة الثامنة", "الحصة التاسعة", "الحصة العاشرة"];
const SEMESTERS_LIST = ["الفصل الدراسي الأول", "الفصل الدراسي الثاني", "الفصل الدراسي الثالث"];

function AtomLogo() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <div className="absolute h-16 w-16 rounded-full border border-cyan-200/80" style={{ transform: "rotate(18deg)" }} />
      <div className="absolute h-12 w-12 rounded-full border border-indigo-200/90" style={{ transform: "rotate(-24deg)" }} />
      <div className="absolute h-20 w-20 rounded-full border border-sky-200/70" style={{ transform: "rotate(32deg)" }} />
      <div className="absolute h-3 w-3 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 shadow-[0_0_18px_rgba(251,191,36,0.8)]" />
      <div className="absolute left-6 top-2 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.8)]" />
      <div className="absolute right-5 bottom-4 h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_16px_rgba(167,139,250,0.8)]" />
      <div className="absolute text-blue-600">
        <Atom className="h-8 w-8 drop-shadow-[0_0_12px_rgba(37,99,235,0.7)]" />
      </div>
    </div>
  );
}

export default function Home() {
  const [userRole, setUserRole] = useState<"none" | "teacher" | "admin">("none");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminLoginError, setAdminLoginError] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  const [adminPassword, setAdminPassword] = useState("lab520");
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  useEffect(() => {
    const savedPass = localStorage.getItem("lab_admin_password");
    if (savedPass) setAdminPassword(savedPass);
  }, []);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) return;
    setAdminPassword(newPasswordInput.trim());
    localStorage.setItem("lab_admin_password", newPasswordInput.trim());
    setPasswordChangeSuccess(true);
    setTimeout(() => {
      setPasswordChangeSuccess(false);
      setNewPasswordInput("");
      setIsChangePasswordModalOpen(false);
    }, 1500);
  };

  const [items, setItems] = useState<LabItem[]>([]);
  const [prepRequests, setPrepRequests] = useState<PrepRequest[]>([]);
  const [breakageRecords, setBreakageRecords] = useState<BreakageRecord[]>([]);
  const [operationalPlans, setOperationalPlans] = useState<OperationalPlanItem[]>([]);
  
  const [academicYears, setAcademicYears] = useState<string[]>(["2026-2027", "2027-2028", "2028-2029"]);
  const [newYearInput, setNewYearInput] = useState("");
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => { if (data.success) setItems(data.items || []); })
      .catch(err => console.error("Error items:", err));

    fetch('/api/breakage')
      .then(res => res.json())
      .then(data => { if (data.success) setBreakageRecords(data.records || []); })
      .catch(err => console.error("Error breakage:", err));

    fetch('/api/plans')
      .then(res => res.json())
      .then(data => { if (data.success) setOperationalPlans(data.plans || []); })
      .catch(err => console.error("Error plans:", err));

    fetch('/api/requests')
      .then(res => res.json())
      .then(data => { if (data.success) setPrepRequests(data.requests || []); })
      .catch(err => console.error("Error requests:", err));
  }, []);

  const [activeView, setActiveView] = useState<"inventory" | "requests" | "plans" | "breakage">("inventory");
  const [selectedSubject, setSelectedSubject] = useState<string>("الكل");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedBreakageSubject, setSelectedBreakageSubject] = useState<string>("الكل");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("2026-2027");
  const [selectedSemester, setSelectedSemester] = useState<string>("الفصل الدراسي الأول");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBreakageModalOpen, setIsBreakageModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [editingItemForm, setEditingItemForm] = useState<LabItem | null>(null);
  
  const [printReportType, setPrintReportType] = useState<"request" | "inventory" | "plan" | "breakage" | null>(null);
  const [selectedRequestForPrint, setSelectedRequestForPrint] = useState<PrepRequest | null>(null);

  const [newItemForm, setNewItemForm] = useState({
    id: "", name: "", subject: "الكيمياء" as any, category: "مواد كيميائية وأحماض" as any, nature: "consumable" as ItemNature, currentStock: "", minLimit: "", unit: "مل", location: "",
  });

  const [formData, setFormData] = useState({
    teacherName: "",
    labTechnician: "أ. سامي عبد الله",
    subject: "الكيمياء" as any,
    grade: "الصف 10",
    track: "متقدم",
    section: "A",
    academicYear: "2026-2027",
    semester: "الفصل الدراسي الأول",
    experimentTitle: "",
    date: new Date().toISOString().split("T")[0],
    period: PERIODS_LIST[1],
  });

  const [requestedItemsList, setRequestedItemsList] = useState<{ itemId: string; quantity: string }[]>([{ itemId: "", quantity: "" }]);
  const [procurementList, setProcurementList] = useState<ProcurementItem[]>([]);
  const [newProcureName, setNewProcureName] = useState("");
  const [newProcureQty, setNewProcureQty] = useState("");
  const [newProcureProvidedBy, setNewProcureProvidedBy] = useState<"أمين المختبر / المدرسة" | "المعلم" | "الطلاب">("أمين المختبر / المدرسة");

  const [breakageForm, setBreakageForm] = useState({
    subject: "الكيمياء" as "الكيمياء" | "الفيزياء" | "الأحياء" | "العلوم العامة",
    itemType: "returnable" as "all" | "returnable" | "consumable",
    itemId: "", quantity: "1", brokenBy: "", reason: "انزلاق أثناء التجربة", teacherName: "",
  });

  const filteredBreakageItems = items.filter((it) => {
    const subjectMatch = it.subject === breakageForm.subject;
    const typeMatch = breakageForm.itemType === "all" || it.nature === breakageForm.itemType;
    return subjectMatch && typeMatch;
  });

  const [planFormData, setPlanFormData] = useState({
    academicYear: "2026-2027",
    semester: "الفصل الدراسي الأول",
    weekNumber: 1,
    day: "الأحد" as any,
    period: PERIODS_LIST[0],
    subject: "الكيمياء" as any,
    grade: "الصف 10",
    track: "متقدم",
    section: "A",
    teacherName: "",
    labTechnician: "أ. سامي عبد الله",
    experimentTitle: "",
    labRoom: "مختبر الكيمياء الرئيسي",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [aiSuggestionMsg, setAiSuggestionMsg] = useState("");

  const stats = useMemo(() => {
    const totalItems = items.length;
    const lowStockCount = items.filter(i => i.nature === "consumable" && i.currentStock <= i.minLimit && i.currentStock > 0).length;
    const returnableCount = items.filter(i => i.nature === "returnable").reduce((acc, i) => acc + i.currentStock, 0);
    const totalBreakages = breakageRecords.reduce((acc, b) => acc + b.quantity, 0);
    return { totalItems, lowStockCount, returnableCount, totalRequests: prepRequests.length, totalPlans: operationalPlans.length, totalBreakages };
  }, [items, prepRequests, operationalPlans, breakageRecords]);

  const availableWeeksList = useMemo(() => {
    const weeks = new Set<number>([1, 2, 3, 4, 5, 6]);
    operationalPlans
      .filter(p => p.academicYear === selectedAcademicYear && p.semester === selectedSemester)
      .forEach(p => weeks.add(p.weekNumber));
    return Array.from(weeks).sort((a, b) => a - b);
  }, [operationalPlans, selectedAcademicYear, selectedSemester]);

  const categoryOptions = useMemo(() => {
    return ["الكل", ...Array.from(new Set(items.map(item => item.category)))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSubject = selectedSubject === "الكل" || item.subject === selectedSubject;
      const matchCategory = selectedCategory === "الكل" || item.category === selectedCategory;
      const matchSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchCategory && matchSearch;
    });
  }, [items, selectedSubject, selectedCategory, searchQuery]);

  const filteredBreakageRecords = useMemo(() => {
    return breakageRecords.filter((record) => {
      return selectedBreakageSubject === "الكل" || record.subject === selectedBreakageSubject;
    });
  }, [breakageRecords, selectedBreakageSubject]);

  const filteredPlans = useMemo(() => {
    return operationalPlans.filter((p) => {
      const matchYear = p.academicYear === selectedAcademicYear;
      const matchSemester = p.semester === selectedSemester;
      const matchWeek = p.weekNumber === selectedWeek;
      const matchSubject = selectedSubject === "الكل" || p.subject === selectedSubject;
      return matchYear && matchSemester && matchWeek && matchSubject;
    });
  }, [operationalPlans, selectedAcademicYear, selectedSemester, selectedWeek, selectedSubject]);

  const availableItemsForModal = useMemo(() => {
    return items.filter(i => i.subject === formData.subject);
  }, [items, formData.subject]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === adminPassword) {
      setUserRole("admin");
      setShowAdminLoginModal(false);
      setAdminPasswordInput("");
      setAdminLoginError(false);
    } else {
      setAdminLoginError(true);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الصنف نهائياً من عهدة المختبر؟")) {
      try {
        const res = await fetch(`/api/items?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setItems(prev => prev.filter(item => item.id !== id));
        } else {
          alert("خطأ أثناء الحذف: " + data.error);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenEditItem = (item: LabItem) => {
    setEditingItemForm({ ...item });
    setIsEditItemModalOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemForm || !editingItemForm.name.trim()) return;

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItemForm)
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(it => it.id === editingItemForm.id ? editingItemForm : it));
        setIsEditItemModalOpen(false);
        setEditingItemForm(null);
      } else {
        alert("خطأ أثناء التعديل: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshInventoryFromDb = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshBreakageFromDb = async () => {
    try {
      const res = await fetch('/api/breakage');
      const data = await res.json();
      if (data.success) setBreakageRecords(data.records || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintRequest = () => {
    if (!selectedRequestForPrint) return;

    const printRoot = document.getElementById('printable-request-area');
    if (!printRoot) return;

    const previousTitle = document.title;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyVisibility = document.body.style.visibility;
    const previousRootStyle = {
      position: printRoot.style.position,
      inset: printRoot.style.inset,
      display: printRoot.style.display,
      padding: printRoot.style.padding,
      background: printRoot.style.background,
      zIndex: printRoot.style.zIndex,
      visibility: printRoot.style.visibility,
    };

    document.title = `طلب-تحضير-${selectedRequestForPrint.id}`;
    document.body.style.overflow = 'visible';
    document.body.style.visibility = 'visible';
    printRoot.style.position = 'fixed';
    printRoot.style.inset = '0';
    printRoot.style.display = 'block';
    printRoot.style.padding = '12mm';
    printRoot.style.background = '#ffffff';
    printRoot.style.zIndex = '2147483647';
    printRoot.style.visibility = 'visible';

    const restore = () => {
      document.title = previousTitle;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.visibility = previousBodyVisibility;
      printRoot.style.position = previousRootStyle.position;
      printRoot.style.inset = previousRootStyle.inset;
      printRoot.style.display = previousRootStyle.display;
      printRoot.style.padding = previousRootStyle.padding;
      printRoot.style.background = previousRootStyle.background;
      printRoot.style.zIndex = previousRootStyle.zIndex;
      printRoot.style.visibility = previousRootStyle.visibility;
    };

    window.onafterprint = () => {
      restore();
      window.onafterprint = null;
    };

    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleUndoLastBreakage = async () => {
    if (!breakageRecords.length) {
      alert("لا توجد حالات كسر حديثة لإلغاء الخصم عنها.");
      return;
    }

    const lastBreakage = breakageRecords[0];
    const targetItem = items.find(item => item.id === lastBreakage.itemId);

    if (!targetItem) {
      setBreakageRecords(prev => prev.slice(1));
      try { await fetch(`/api/breakage?id=${lastBreakage.id}`, { method: 'DELETE' }); } catch (err) { console.error(err); }
      return;
    }

    const restoredItem = { ...targetItem, currentStock: targetItem.currentStock + lastBreakage.quantity };
    setItems(prev => prev.map(item => item.id === targetItem.id ? restoredItem : item));
    setBreakageRecords(prev => prev.filter(item => item.id !== lastBreakage.id));
    await persistItemToDb(restoredItem);

    try {
      await fetch(`/api/breakage?id=${lastBreakage.id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput.trim()) return;
    const formattedYear = newYearInput.trim();
    if (!academicYears.includes(formattedYear)) {
      setAcademicYears([...academicYears, formattedYear]);
      setSelectedAcademicYear(formattedYear);
    }
    setNewYearInput("");
    setIsAddYearModalOpen(false);
  };

  const handleAiSuggest = () => {
    const title = formData.experimentTitle.toLowerCase();
    if (!title) {
      setAiSuggestionMsg("يرجى كتابة عنوان التجربة أولاً ليتمكن الذكاء الاصطناعي من اقتراح المواد والأدوات المناسبة.");
      return;
    }

    let suggestedItems: { itemId: string; quantity: string }[] = [];
    let suggestedProcurements: ProcurementItem[] = [];

    if (title.includes("معايرة") || title.includes("حمض") || title.includes("قاعدة") || title.includes("تعادل")) {
      const hcl = items.find(i => i.name.includes("هيدروكلوريك") || i.name.includes("HCl"));
      const naoh = items.find(i => i.name.includes("هيدروكسيد") || i.name.includes("NaOH"));
      const beaker = items.find(i => i.name.includes("كؤوس"));
      const buret = items.find(i => i.name.includes("سحاحة"));

      if (hcl) suggestedItems.push({ itemId: hcl.id, quantity: "50" });
      if (naoh) suggestedItems.push({ itemId: naoh.id, quantity: "50" });
      if (beaker) suggestedItems.push({ itemId: beaker.id, quantity: "2" });
      if (buret) suggestedItems.push({ itemId: buret.id, quantity: "1" });
      setAiSuggestionMsg("✨ اقتراح ذكي: تم تحديد أحماض وقواعد وسحاحة وكؤوس زجاجية للمعايرة.");
    } 
    else if (title.includes("تشريح") || title.includes("خلية") || title.includes("نبات") || title.includes("أنسجة")) {
      const microscope = items.find(i => i.name.includes("مجهر"));
      const iodine = items.find(i => i.name.includes("صبغة اليود"));
      const dissect = items.find(i => i.name.includes("تشريح"));

      if (microscope) suggestedItems.push({ itemId: microscope.id, quantity: "1" });
      if (iodine) suggestedItems.push({ itemId: iodine.id, quantity: "20" });
      if (dissect) suggestedItems.push({ itemId: dissect.id, quantity: "1" });

      if (title.includes("تشريح")) {
        suggestedProcurements.push({ name: "قلب وكبد خروف طازج", quantity: "3 حبات", providedBy: "أمين المختبر / المدرسة" });
      }
      setAiSuggestionMsg("✨ اقتراح ذكي: تم اقتراح المجاهر، الصبغات، أدوات التشريح، وعينات الشراء المناسبة.");
    } 
    else {
      const defaultItem = availableItemsForModal[0];
      if (defaultItem) suggestedItems.push({ itemId: defaultItem.id, quantity: "2" });
      setAiSuggestionMsg("✨ اقتراح ذكي: تم إدراج أصناف افتراضية تناسب التخصص المختار.");
    }

    if (suggestedItems.length > 0) setRequestedItemsList(suggestedItems);
    if (suggestedProcurements.length > 0) setProcurementList(suggestedProcurements);
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.name.trim()) return;

    const generatedId = newItemForm.id.trim() || `${newItemForm.subject === "الكيمياء" ? "CH" : newItemForm.subject === "الفيزياء" ? "PH" : newItemForm.subject === "الأحياء" ? "BIO" : "SCI"}-${Date.now().toString().slice(-3)}`;

    const newItem: LabItem = {
      id: generatedId.toUpperCase(),
      name: newItemForm.name.trim(),
      subject: newItemForm.subject,
      category: newItemForm.category,
      nature: newItemForm.nature,
      currentStock: parseFloat(newItemForm.currentStock) || 0,
      minLimit: parseFloat(newItemForm.minLimit) || 0,
      unit: newItemForm.unit.trim() || "قطعة",
      location: newItemForm.location.trim() || "المستودع الرئيسي",
    };

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => [newItem, ...prev]);
        setIsAddItemModalOpen(false);
        setNewItemForm({ id: "", name: "", subject: "الكيمياء", category: "مواد كيميائية وأحماض", nature: "consumable", currentStock: "", minLimit: "", unit: "مل", location: "" });
      }
    } catch (err) { console.error(err); }
  };

  const persistItemToDb = async (item: LabItem) => {
    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch (err) { console.error(err); }
  };

  const handleAddItemRow = () => setRequestedItemsList([...requestedItemsList, { itemId: "", quantity: "" }]);
  const handleRemoveItemRow = (index: number) => requestedItemsList.length > 1 && setRequestedItemsList(requestedItemsList.filter((_, i) => i !== index));
  const handleItemRowChange = (index: number, field: "itemId" | "quantity", value: string) => {
    const updated = [...requestedItemsList];
    updated[index][field] = value;
    setRequestedItemsList(updated);
  };

  const handleAddProcurement = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const cleanName = newProcureName.trim();
    const cleanQty = newProcureQty.trim();

    if (!cleanName || !cleanQty) {
      setErrorMsg("يرجى كتابة اسم المادة والكمية قبل إضافتها إلى قائمة الشراء الخارجي.");
      return;
    }

    setProcurementList(prev => [...prev, { name: cleanName, quantity: cleanQty, providedBy: newProcureProvidedBy }]);
    setNewProcureName("");
    setNewProcureQty("");
    setNewProcureProvidedBy("أمين المختبر / المدرسة");
    setErrorMsg("");
  };

  const handleRemoveProcurement = (idx: number) => setProcurementList(procurementList.filter((_, i) => i !== idx));

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedEntries: RequestedItemEntry[] = [];
    const consumableDeductions: { [id: string]: number } = {};

    for (let i = 0; i < requestedItemsList.length; i++) {
      const row = requestedItemsList[i];
      if (!row.itemId) {
        setErrorMsg(`يرجى تحديد الصنف في السطر رقم (${i + 1}).`);
        return;
      }
      const qty = parseFloat(row.quantity);
      if (isNaN(qty) || qty <= 0) {
        setErrorMsg(`يرجى إدخال كمية صحيحة في السطر رقم (${i + 1}).`);
        return;
      }

      const itemObj = items.find(it => it.id === row.itemId);
      if (!itemObj) continue;

      if (itemObj.nature === "consumable") {
        const alreadyDeducted = consumableDeductions[itemObj.id] || 0;
        if (qty + alreadyDeducted > itemObj.currentStock) {
          setErrorMsg(`كمية الكيماويات المطلوبة من (${itemObj.name}) تفوق الرصيد المتوفر (${itemObj.currentStock} ${itemObj.unit})!`);
          return;
        }
        consumableDeductions[itemObj.id] = (consumableDeductions[itemObj.id] || 0) + qty;
      } else {
        if (qty > itemObj.currentStock) {
          setErrorMsg(`العدد المطلوب من (${itemObj.name}) غير متوفر بالكامل حالياً!`);
          return;
        }
      }

      parsedEntries.push({
        itemId: itemObj.id,
        itemName: itemObj.name,
        category: itemObj.category,
        nature: itemObj.nature,
        quantity: qty,
        unit: itemObj.unit
      });
    }

    const updatedItems = items.map(item => {
      if (!consumableDeductions[item.id]) return item;
      return { ...item, currentStock: item.currentStock - consumableDeductions[item.id] };
    });

    const cleanedProcurementList = procurementList
      .map(item => ({
        name: item.name.trim(),
        quantity: item.quantity.trim(),
        providedBy: item.providedBy,
      }))
      .filter(item => item.name && item.quantity);

    setItems(updatedItems);
    for (const updatedItem of updatedItems) {
      if (consumableDeductions[updatedItem.id]) {
        await persistItemToDb(updatedItem);
      }
    }

    const newRequest: PrepRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      teacherName: formData.teacherName,
      labTechnician: formData.labTechnician.trim() || "أمين المختبر",
      subject: formData.subject,
      grade: formData.grade,
      track: formData.track,
      section: formData.section.toUpperCase(),
      academicYear: formData.academicYear,
      semester: formData.semester,
      experimentTitle: formData.experimentTitle,
      date: formData.date,
      period: formData.period,
      items: parsedEntries,
      procurements: cleanedProcurementList,
    };

    setPrepRequests(prev => [newRequest, ...prev]);

    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
    } catch (err) { console.error(err); }

    setIsModalOpen(false);
    setSelectedRequestForPrint(newRequest);
    setPrintReportType("request");
  };

  const handleRecordBreakage = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemObj = items.find(it => it.id === breakageForm.itemId);
    if (!itemObj) return;

    const qty = parseInt(breakageForm.quantity) || 1;
    if (qty > itemObj.currentStock) {
      alert("الكمية المسجلة أكبر من الرصيد المتوفر!");
      return;
    }

    const updatedItem = { ...itemObj, currentStock: itemObj.currentStock - qty };
    setItems(prev => prev.map(it => it.id === itemObj.id ? updatedItem : it));
    await persistItemToDb(updatedItem);

    const newBreakage: BreakageRecord = {
      id: `BRK-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split("T")[0],
      itemId: itemObj.id,
      itemName: itemObj.name,
      subject: breakageForm.subject,
      quantity: qty,
      brokenBy: breakageForm.brokenBy || "غير محدد",
      reason: breakageForm.reason,
      teacherName: breakageForm.teacherName || "المعلم المشرف",
    };

    setBreakageRecords(prev => [newBreakage, ...prev]);

    try {
      await fetch('/api/breakage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBreakage)
      });
    } catch (err) { console.error(err); }

    setIsBreakageModalOpen(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPlanItem: OperationalPlanItem = {
      id: `PLAN-${Date.now().toString().slice(-4)}`,
      academicYear: planFormData.academicYear,
      semester: planFormData.semester,
      weekNumber: Number(planFormData.weekNumber) || 1,
      day: planFormData.day,
      period: planFormData.period,
      subject: planFormData.subject,
      grade: planFormData.grade,
      track: planFormData.track,
      section: planFormData.section.toUpperCase(),
      teacherName: planFormData.teacherName,
      labTechnician: planFormData.labTechnician.trim() || "أمين المختبر",
      experimentTitle: planFormData.experimentTitle,
      labRoom: planFormData.labRoom,
      status: "مجدولة",
    };

    setOperationalPlans(prev => [...prev, newPlanItem]);

    try {
      await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlanItem)
      });
    } catch (err) { console.error(err); }

    setIsPlanModalOpen(false);
  };

  if (userRole === "none") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6" dir="rtl">
        <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-slate-100 text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-blue-100">
            <AtomLogo />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">نظام إدارة المختبرات المدرسية</h1>
            <p className="text-sm text-slate-500 mt-2">يرجى اختيار بوابة الدخول المناسبة لصلاحياتك:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => setUserRole("teacher")}
              className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 transition flex flex-col items-center text-center group shadow-sm"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">بوابة المعلم</h3>
              <p className="text-xs text-slate-500 mt-1">الاطلاع على محتويات المختبر وتقديم طلبات التحضير والصرف</p>
            </button>

            <button
              onClick={() => setShowAdminLoginModal(true)}
              className="p-6 rounded-xl border-2 border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 transition flex flex-col items-center text-center group shadow-sm"
            >
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">بوابة أمين المختبر (الأدمن)</h3>
              <p className="text-xs text-slate-500 mt-1">إدارة العهدة، الحذف والإضافة، تسجيل الكسر، والخطة التشغيلية</p>
            </button>
          </div>
        </div>

        {showAdminLoginModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-teal-700 font-bold">
                  <Lock className="w-4 h-4" />
                  <h3>تسجيل دخول أمين المختبر</h3>
                </div>
                <button onClick={() => setShowAdminLoginModal(false)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleAdminLogin} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">أدخل كلمة المرور السرية للأدمن</label>
                  <input
                    type="password"
                    required
                    placeholder="•••••"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold text-center"
                  />
                </div>
                {adminLoginError && <p className="text-rose-600 text-xs text-center font-bold">كلمة المرور غير صحيحة! (الرمز الافتراضي: lab520)</p>}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setShowAdminLoginModal(false)} className="px-3 py-1.5 text-xs text-slate-600">إلغاء</button>
                  <button type="submit" className="px-4 py-2 text-xs font-bold bg-teal-700 text-white rounded-lg">دخول اللوحة</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-800 print:bg-white print:p-0" dir="rtl">
      
      <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">نظام إدارة المختبرات المدرسية الشامل</h1>
            {userRole === "admin" ? (
              <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> أمين المختبر (قاعدة بيانات سحابية Neon 100%)
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> معلم مادة (صلاحية الطلب والاطلاع)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">طلبات التحضير، الخطة التشغيلية بالفصول والأعوام، جرد العهدة، وسجل الكسر مرتبطة بالكامل بالسحابة</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {userRole === "admin" && (
            <>
              <button 
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
              >
                <KeyRound className="w-4 h-4" />
                <span>تغيير كلمة السر</span>
              </button>
              <button 
                onClick={() => setIsAddYearModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ عام دراسي</span>
              </button>
              <button 
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
              >
                <PackagePlus className="w-4 h-4" />
                <span>+ إضافة صنف</span>
              </button>
              <button 
                onClick={() => setIsBreakageModalOpen(true)}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>تسجيل كسر</span>
              </button>
            </>
          )}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow"
          >
            <ClipboardList className="w-4 h-4" />
            <span>طلب تحضير و صرف</span>
          </button>

          <button
            onClick={() => setUserRole("none")}
            className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">أجهزة وزجاجيات العهدة</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.returnableCount} <span className="text-xs font-normal text-slate-500">قطعة</span></p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Microscope className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">كيماويات قاربت على النفاد</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.lowStockCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">طلبات التحضير المنجزة</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.totalRequests}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">إجمالي قطع الكسر والتالف</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.totalBreakages}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="print:hidden flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveView("inventory")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeView === "inventory" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          المخزون والعهدة وتصنيف المواد ({items.length})
        </button>
        <button
          onClick={() => setActiveView("plans")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeView === "plans" ? "border-teal-600 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          الخطة التشغيلية ({operationalPlans.length})
        </button>
        <button
          onClick={() => setActiveView("breakage")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeView === "breakage" ? "border-rose-600 text-rose-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          سجل الكسر والتوالف ({breakageRecords.length})
        </button>
        <button
          onClick={() => setActiveView("requests")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeView === "requests" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          سجل التحضير والاستمارات ({prepRequests.length})
        </button>
      </div>

      {activeView === "inventory" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="print:hidden p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {["الكل", "الكيمياء", "الفيزياء", "الأحياء", "العلوم العامة"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedSubject(tab)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                      selectedSubject === tab ? "bg-slate-900 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {categoryOptions.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedCategory(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition whitespace-nowrap ${
                      selectedCategory === tab ? "bg-blue-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {userRole === "admin" && (
                <>
                  <button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة صنف</span>
                  </button>
                  <button
                    onClick={refreshInventoryFromDb}
                    className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تحديث المخزون من قاعدة البيانات</span>
                  </button>
                </>
              )}

              {breakageRecords.length > 0 && (
                <button
                  onClick={handleUndoLastBreakage}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إلغاء آخر خصم</span>
                </button>
              )}

              <button
                onClick={() => setPrintReportType("inventory")}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة جرد المخزون PDF</span>
              </button>
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث عن مادة، جهاز، أو موقع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">كود الصنف</th>
                  <th className="px-6 py-4 font-semibold">اسم الأداة / المادة</th>
                  <th className="px-6 py-4 font-semibold">التخصص</th>
                  <th className="px-6 py-4 font-semibold">التصنيف</th>
                  <th className="px-6 py-4 font-semibold">طبيعة الصنف</th>
                  <th className="px-6 py-4 font-semibold">الموقع</th>
                  <th className="px-6 py-4 font-semibold text-center">الرصيد الفعلي</th>
                  <th className="px-6 py-4 font-semibold text-center">الحالة</th>
                  {userRole === "admin" && <th className="px-6 py-4 font-semibold text-center">الإجراءات (تعديل / حذف)</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/75 transition">
                    <td className="px-6 py-4 font-mono font-medium text-slate-600">{item.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded text-xs bg-slate-100">{item.subject}</span></td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{item.category}</td>
                    <td className="px-6 py-4">
                      {item.nature === "consumable" ? (
                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">مستهلك (كيماويات)</span>
                      ) : (
                        <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">عهدة مستردة</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.location}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{item.currentStock} {item.unit}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.currentStock > item.minLimit ? "متوفر" : "منخفض"}
                      </span>
                    </td>
                    {userRole === "admin" && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg transition"
                            title="تعديل الصنف"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition"
                            title="حذف الصنف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === "plans" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="print:hidden p-4 border-b border-slate-200 flex flex-col gap-3 bg-slate-50/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">فلتر العام الدراسي:</label>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    {academicYears.map(yr => <option key={yr} value={yr}>العام الدراسي {yr}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">فلتر الفصل الدراسي:</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    {SEMESTERS_LIST.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {userRole === "admin" && (
                  <button
                    onClick={() => setIsPlanModalOpen(true)}
                    className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة تجربة للخطة</span>
                  </button>
                )}
                <button
                  onClick={() => setPrintReportType("plan")}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الخطة PDF</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-200 overflow-x-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">الأسابيع الدراسية ({selectedSemester}):</span>
              <div className="flex gap-1 bg-slate-200/80 p-1 rounded-lg overflow-x-auto">
                {availableWeeksList.map((wk) => (
                  <button
                    key={wk}
                    onClick={() => setSelectedWeek(wk)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition whitespace-nowrap ${
                      selectedWeek === wk ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    أسبوع {wk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">اليوم والحصة</th>
                  <th className="px-6 py-4 font-semibold">الصف والشعبة</th>
                  <th className="px-6 py-4 font-semibold">المادة والتجربة</th>
                  <th className="px-6 py-4 font-semibold">المعلم المسؤول</th>
                  <th className="px-6 py-4 font-semibold">أمين المختبر</th>
                  <th className="px-6 py-4 font-semibold">المختبر</th>
                  <th className="px-6 py-4 font-semibold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      لا توجد تجارب مجدولة في الأسبوع ({selectedWeek}) لـ ({selectedSemester} - {selectedAcademicYear}).
                    </td>
                  </tr>
                ) : (
                  filteredPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/75 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{plan.day} - {plan.period}</td>
                      <td className="px-6 py-4">{plan.grade} ({plan.track}) - شعبة {plan.section}</td>
                      <td className="px-6 py-4 font-medium text-teal-700">{plan.experimentTitle}</td>
                      <td className="px-6 py-4 text-slate-700">{plan.teacherName}</td>
                      <td className="px-6 py-4 text-slate-700 text-xs">{plan.labTechnician}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{plan.labRoom}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {plan.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === "breakage" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="print:hidden p-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">سجل كسر الزجاجيات وتلف الأجهزة</h3>
              <p className="text-xs text-slate-500 mt-0.5">توثيق حالات الكسر وخصمها من عهدة المختبر</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {userRole === "admin" && (
                <button
                  onClick={() => setIsBreakageModalOpen(true)}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تسجيل كسر جديد</span>
                </button>
              )}
              <button
                onClick={() => setPrintReportType("breakage")}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة محضر التوالف PDF</span>
              </button>
            </div>
          </div>

          <div className="print:hidden p-4 border-b border-slate-200 bg-slate-50/60">
            <div className="flex flex-wrap items-center gap-2">
              {['الكل', 'الكيمياء', 'الفيزياء', 'الأحياء', 'العلوم العامة'].map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedBreakageSubject(subject)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedBreakageSubject === subject ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {subject}
                </button>
              ))}
              <button
                onClick={refreshBreakageFromDb}
                className="ml-auto flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                تحديث السجل من قاعدة البيانات
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">رقم المحضر</th>
                  <th className="px-6 py-4 font-semibold">التاريخ</th>
                  <th className="px-6 py-4 font-semibold">المادة</th>
                  <th className="px-6 py-4 font-semibold">الصنف المكسور</th>
                  <th className="px-6 py-4 font-semibold text-center">الكمية التالفة</th>
                  <th className="px-6 py-4 font-semibold">المتسبب</th>
                  <th className="px-6 py-4 font-semibold">السبب والملاحظات</th>
                  <th className="px-6 py-4 font-semibold">المعلم المشرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBreakageRecords.map((brk) => (
                  <tr key={brk.id} className="hover:bg-slate-50/75 transition">
                    <td className="px-6 py-4 font-mono font-bold text-rose-700">{brk.id}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{brk.date}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">{brk.subject}</span></td>
                    <td className="px-6 py-4 font-bold text-slate-900">{brk.itemName}</td>
                    <td className="px-6 py-4 text-center font-bold text-rose-600">-{brk.quantity}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{brk.brokenBy}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{brk.reason}</td>
                    <td className="px-6 py-4 text-slate-700 text-xs">{brk.teacherName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === "requests" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">سجل طلبات التحضير واستمارات الصرف</h3>
            <p className="text-xs text-slate-500 mt-0.5">طباعة وتحويل أي طلب تحضير إلى ملف PDF رسمي بضغطة واحدة</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">رقم الاستمارة</th>
                  <th className="px-6 py-4 font-semibold">المعلم / أمين المختبر</th>
                  <th className="px-6 py-4 font-semibold">الصف والفصل</th>
                  <th className="px-6 py-4 font-semibold">عنوان التجربة</th>
                  <th className="px-6 py-4 font-semibold">المواد والأجهزة المصروفة</th>
                  <th className="px-6 py-4 font-semibold">مواد يتم شراؤها</th>
                  <th className="px-6 py-4 font-semibold text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {prepRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/75 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">{req.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{req.teacherName}</div>
                      <div className="text-xs text-amber-700">أمين المختبر: {req.labTechnician}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{req.grade} - شعبة {req.section}</span>
                      <div className="text-xs text-slate-500">{req.semester} ({req.academicYear})</div>
                    </td>
                    <td className="px-6 py-4 text-indigo-700 font-medium">{req.experimentTitle}</td>
                    <td className="px-6 py-4">
                      {req.items.map((it, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded inline-block ml-1">
                          {it.itemName} ({it.quantity} {it.unit})
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      {req.procurements?.map((p, idx) => (
                        <span key={idx} className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded inline-block ml-1">
                          {p.name} ({p.quantity})
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedRequestForPrint(req);
                          printReportType !== "request" && setPrintReportType("request");
                        }}
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>استمارة PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- النوافذ المنبثقة والمودالات (Modals) --- */}

      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">تغيير كلمة مرور أمين المختبر</h3>
              <button onClick={() => setIsChangePasswordModalOpen(false)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdatePassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="text"
                  required
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold text-center"
                />
              </div>
              {passwordChangeSuccess && (
                <p className="text-emerald-600 text-xs text-center font-bold">تم تغيير كلمة المرور بنجاح!</p>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsChangePasswordModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">إلغاء</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg">حفظ التعديل</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddYearModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">إضافة عام دراسي جديد</h3>
              <button onClick={() => setIsAddYearModalOpen(false)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddNewAcademicYear} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">السنة الدراسية (مثال: 2027-2028)</label>
                <input
                  type="text"
                  required
                  placeholder="2027-2028"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold text-center"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddYearModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">إلغاء</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg">إضافة العام</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <PackagePlus className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">إضافة صنف جديد إلى عهدة المختبر</h3>
              </div>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddNewItem} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">كود الصنف (اختياري)</label>
                  <input type="text" placeholder="CH-005" value={newItemForm.id} onChange={(e) => setNewItemForm({ ...newItemForm, id: e.target.value })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">التخصص</label>
                  <select value={newItemForm.subject} onChange={(e) => setNewItemForm({ ...newItemForm, subject: e.target.value as any })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none">
                    <option value="الكيمياء">الكيمياء</option><option value="الفيزياء">الفيزياء</option><option value="الأحياء">الأحياء</option><option value="العلوم العامة">العلوم العامة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الأداة / الجهاز / المادة *</label>
                <input type="text" required placeholder="حمض النيتريك 1M أو مجهر" value={newItemForm.name} onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })} className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">التصنيف</label>
                  <select value={newItemForm.category} onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value as any })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none">
                    <option value="مواد كيميائية وأحماض">مواد كيميائية وأحماض</option><option value="أدوات زجاجية">أدوات زجاجية</option><option value="أجهزة ومعدات">أجهزة ومعدات</option><option value="نماذج ومجسمات">نماذج ومجسمات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">طبيعة الصنف وسياسة الخصم</label>
                  <select value={newItemForm.nature} onChange={(e) => setNewItemForm({ ...newItemForm, nature: e.target.value as ItemNature })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold">
                    <option value="returnable">عهدة مستردة (لا تخصم إلا بالكسر)</option><option value="consumable">مستهلك (يخصم عند الاستهلاك)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الكمية المتوفرة *</label>
                  <input type="number" step="any" required placeholder="50" value={newItemForm.currentStock} onChange={(e) => setNewItemForm({ ...newItemForm, currentStock: e.target.value })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وحدة القياس *</label>
                  <input type="text" required placeholder="قطعة / مل" value={newItemForm.unit} onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-center outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">حد الإنذار</label>
                  <input type="number" step="any" placeholder="10" value={newItemForm.minLimit} onChange={(e) => setNewItemForm({ ...newItemForm, minLimit: e.target.value })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-center outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">موقع التخزين في المختبر</label>
                <input type="text" placeholder="خزانة الكيماويات A" value={newItemForm.location} onChange={(e) => setNewItemForm({ ...newItemForm, location: e.target.value })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsAddItemModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">إلغاء</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow">حفظ في قاعدة البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditItemModalOpen && editingItemForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-amber-700">
                <Edit3 className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">تعديل بيانات الصنف [{editingItemForm.id}]</h3>
              </div>
              <button onClick={() => setIsEditItemModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUpdateItem} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">كود الصنف (ثابت)</label>
                  <input type="text" disabled value={editingItemForm.id} className="w-full text-xs p-2.5 bg-slate-100 border border-slate-300 rounded-lg outline-none font-mono text-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">التخصص</label>
                  <select value={editingItemForm.subject} onChange={(e) => setEditingItemForm({ ...editingItemForm, subject: e.target.value as any })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none">
                    <option value="الكيمياء">الكيمياء</option><option value="الفيزياء">الفيزياء</option><option value="الأحياء">الأحياء</option><option value="العلوم العامة">العلوم العامة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الأداة / الجهاز / المادة *</label>
                <input type="text" required value={editingItemForm.name} onChange={(e) => setEditingItemForm({ ...editingItemForm, name: e.target.value })} className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">التصنيف</label>
                  <select value={editingItemForm.category} onChange={(e) => setEditingItemForm({ ...editingItemForm, category: e.target.value as any })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none">
                    <option value="مواد كيميائية وأحماض">مواد كيميائية وأحماض</option><option value="أدوات زجاجية">أدوات زجاجية</option><option value="أجهزة ومعدات">أجهزة ومعدات</option><option value="نماذج ومجسمات">نماذج ومجسمات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">طبيعة الصنف وسياسة الخصم</label>
                  <select value={editingItemForm.nature} onChange={(e) => setEditingItemForm({ ...editingItemForm, nature: e.target.value as ItemNature })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold">
                    <option value="returnable">عهدة مستردة (لا تخصم إلا بالكسر)</option><option value="consumable">مستهلك (يخصم عند الاستهلاك)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الرصيد الفعلي *</label>
                  <input type="number" step="any" required value={editingItemForm.currentStock} onChange={(e) => setEditingItemForm({ ...editingItemForm, currentStock: parseFloat(e.target.value) || 0 })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">وحدة القياس *</label>
                  <input type="text" required value={editingItemForm.unit} onChange={(e) => setEditingItemForm({ ...editingItemForm, unit: e.target.value })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-center outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">حد الإنذار</label>
                  <input type="number" step="any" value={editingItemForm.minLimit} onChange={(e) => setEditingItemForm({ ...editingItemForm, minLimit: parseFloat(e.target.value) || 0 })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-center outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">موقع التخزين في المختبر</label>
                <input type="text" value={editingItemForm.location} onChange={(e) => setEditingItemForm({ ...editingItemForm, location: e.target.value })} className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsEditItemModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">إلغاء</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow">تحديث في قاعدة البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">طلب تحضير وصرف تجربة مخبرية</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1"><X className="w-5 h-5" /></button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> <span>{errorMsg}</span>
              </div>
            )}

            {aiSuggestionMsg && (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{aiSuggestionMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المعلم</label>
                  <input type="text" required placeholder="أ. محمد مدحت" value={formData.teacherName} onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })} className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">أمين المختبر المشرف</label>
                  <input type="text" required placeholder="أ. سامي عبد الله" value={formData.labTechnician} onChange={(e) => setFormData({ ...formData, labTechnician: e.target.value })} className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">العام الدراسي</label>
                  <select value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-none font-bold">
                    {academicYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الفصل الدراسي</label>
                  <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-none font-bold">
                    {SEMESTERS_LIST.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">الصف</label>
                  <select value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} className="w-full text-sm p-2 bg-white border border-slate-300 rounded-lg outline-none">
                    {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">المسار</label>
                  <select value={formData.track} onChange={(e) => setFormData({ ...formData, track: e.target.value })} className="w-full text-sm p-2 bg-white border border-slate-300 rounded-lg outline-none">
                    <option value="عام">عام</option><option value="متقدم">متقدم</option><option value="أساسي">أساسي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">الشعبة</label>
                  <input type="text" required placeholder="A" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="w-full text-sm p-2 bg-white border border-slate-300 rounded-lg text-center font-bold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">التخصص</label>
                  <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value as any, requestedItemsList: [{ itemId: "", quantity: "" }] } as any)} className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none">
                    <option value="الكيمياء">الكيمياء</option><option value="الفيزياء">الفيزياء</option><option value="الأحياء">الأحياء</option><option value="العلوم العامة">العلوم العامة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الحصة</label>
                  <select value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none">
                    {PERIODS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">عنوان التجربة / النشاط</label>
                  <button type="button" onClick={handleAiSuggest} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 transition">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>💡 اقتراح ذكي للأدوات</span>
                  </button>
                </div>
                <input type="text" required placeholder="المعايرة بين حمض وقاعدة، تشريح قلب خروف" value={formData.experimentTitle} onChange={(e) => setFormData({ ...formData, experimentTitle: e.target.value })} className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-medium" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ التنفيذ</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">الأدوات، الزجاجيات، والكيماويات من المخزن:</span>
                  <button type="button" onClick={handleAddItemRow} className="text-xs font-bold text-blue-700 bg-white border border-blue-300 px-2.5 py-1 rounded-lg">+ إضافة صنف</button>
                </div>
                {requestedItemsList.map((row, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                    <select required value={row.itemId} onChange={(e) => handleItemRowChange(index, "itemId", e.target.value)} className="flex-1 text-xs p-1.5 bg-slate-50 border border-slate-300 rounded outline-none">
                      <option value="">-- اختر الصنف --</option>
                      {availableItemsForModal.map(it => <option key={it.id} value={it.id}>{it.name} [{it.nature === "consumable" ? "مستهلك" : "عهدة"}] ({it.currentStock} {it.unit})</option>)}
                    </select>
                    <input type="number" step="any" required placeholder="الكمية" value={row.quantity} onChange={(e) => handleItemRowChange(index, "quantity", e.target.value)} className="w-24 text-xs p-1.5 bg-slate-50 border border-slate-300 rounded text-center outline-none" />
                    {requestedItemsList.length > 1 && <button type="button" onClick={() => handleRemoveItemRow(index)} className="text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                <span className="text-xs font-bold text-emerald-900">مواد شراء خارجية (عينات تشريح طازجة، ثلج، نباتات...):</span>
                <div className="flex gap-2">
                  <input type="text" placeholder="اسم العينة (قلب خروف)" value={newProcureName} onChange={(e) => setNewProcureName(e.target.value)} className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded outline-none" />
                  <input type="text" placeholder="الكمية" value={newProcureQty} onChange={(e) => setNewProcureQty(e.target.value)} className="w-20 text-xs p-1.5 bg-white border border-slate-300 rounded outline-none text-center" />
                  <select value={newProcureProvidedBy} onChange={(e) => setNewProcureProvidedBy(e.target.value as any)} className="text-xs p-1.5 bg-white border border-slate-300 rounded outline-none">
                    <option value="أمين المختبر / المدرسة">المدرسة</option><option value="المعلم">المعلم</option><option value="الطلاب">الطلاب</option>
                  </select>
                  <button type="button" onClick={handleAddProcurement} className="bg-emerald-700 text-white text-xs px-3 py-1.5 rounded font-bold">+ إضافة</button>
                </div>
                {procurementList.map((p, idx) => (
                  <div key={idx} className="flex justify-between bg-white px-2 py-1 rounded text-xs border border-emerald-200">
                    <span>{p.name} ({p.quantity}) - {p.providedBy}</span>
                    <button type="button" onClick={() => handleRemoveProcurement(idx)} className="text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">إلغاء</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">اعتماد الطلب والطباعة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBreakageModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">محضر إثبات كسر / تلف عهدة</h3>
              <button onClick={() => setIsBreakageModalOpen(false)} className="text-slate-400 p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRecordBreakage} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المادة</label>
                  <select
                    value={breakageForm.subject}
                    onChange={(e) => setBreakageForm({ ...breakageForm, subject: e.target.value as any, itemId: "" })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="الكيمياء">الكيمياء</option>
                    <option value="الفيزياء">الفيزياء</option>
                    <option value="الأحياء">الأحياء</option>
                    <option value="العلوم العامة">العلوم العامة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المخزون / العهدة</label>
                  <select
                    value={breakageForm.itemType}
                    onChange={(e) => setBreakageForm({ ...breakageForm, itemType: e.target.value as any, itemId: "" })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="returnable">العهدة</option>
                    <option value="consumable">المخزون</option>
                    <option value="all">الكل</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الصنف التالف من العهدة أو المخزون</label>
                <select
                  required
                  value={breakageForm.itemId}
                  onChange={(e) => setBreakageForm({ ...breakageForm, itemId: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                >
                  <option value="">-- اختر الصنف --</option>
                  {filteredBreakageItems.map(it => (
                    <option key={it.id} value={it.id}>{it.name} ({it.currentStock} {it.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الكمية</label>
                  <input type="number" min="1" required value={breakageForm.quantity} onChange={(e) => setBreakageForm({ ...breakageForm, quantity: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المعلم المشرف</label>
                  <input type="text" required placeholder="أ. محمد مدحت" value={breakageForm.teacherName} onChange={(e) => setBreakageForm({ ...breakageForm, teacherName: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المتسبب (الطالب أو المجموعة)</label>
                <input type="text" placeholder="المجموعة 3" value={breakageForm.brokenBy} onChange={(e) => setBreakageForm({ ...breakageForm, brokenBy: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">السبب والملاحظات</label>
                <textarea rows={2} value={breakageForm.reason} onChange={(e) => setBreakageForm({ ...breakageForm, reason: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsBreakageModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">إلغاء</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg">تأكيد الخصم</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">إضافة تجربة للخطة التشغيلية</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreatePlan} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">العام الدراسي</label>
                  <select value={planFormData.academicYear} onChange={(e) => setPlanFormData({ ...planFormData, academicYear: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold">
                    {academicYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الفصل الدراسي</label>
                  <select value={planFormData.semester} onChange={(e) => setPlanFormData({ ...planFormData, semester: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold">
                    {SEMESTERS_LIST.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الأسبوع</label>
                  <input type="number" min="1" required value={planFormData.weekNumber} onChange={(e) => setPlanFormData({ ...planFormData, weekNumber: Number(e.target.value) })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-center" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">اليوم</label>
                  <select value={planFormData.day} onChange={(e) => setPlanFormData({ ...planFormData, day: e.target.value as any })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg">
                    <option value="السبت">السبت</option><option value="الأحد">الأحد</option><option value="الإثنين">الإثنين</option><option value="الثلاثاء">الثلاثاء</option><option value="الأربعاء">الأربعاء</option><option value="الخميس">الخميس</option><option value="الجمعة">الجمعة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الحصة (1-10)</label>
                  <select value={planFormData.period} onChange={(e) => setPlanFormData({ ...planFormData, period: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg">
                    {PERIODS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الصف</label>
                  <select value={planFormData.grade} onChange={(e) => setPlanFormData({ ...planFormData, grade: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg">
                    {GRADES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المسار</label>
                  <select value={planFormData.track} onChange={(e) => setPlanFormData({ ...planFormData, track: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg">
                    <option value="عام">عام</option><option value="متقدم">متقدم</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الشعبة</label>
                  <input type="text" required placeholder="A" value={planFormData.section} onChange={(e) => setPlanFormData({ ...planFormData, section: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المعلم المنفذ</label>
                  <input type="text" required placeholder="أ. محمد مدحت" value={planFormData.teacherName} onChange={(e) => setPlanFormData({ ...planFormData, teacherName: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">أمين المختبر</label>
                  <input type="text" required placeholder="أ. سامي عبد الله" value={planFormData.labTechnician} onChange={(e) => setPlanFormData({ ...planFormData, labTechnician: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان التجربة المقررة</label>
                <input type="text" required placeholder="تحقيق قانون بويل" value={planFormData.experimentTitle} onChange={(e) => setPlanFormData({ ...planFormData, experimentTitle: e.target.value })} className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsPlanModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">إلغاء</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg">إدراج في الخطة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- تقارير الطباعة PDF --- */}
      {printReportType === "inventory" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-transparent">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto print:shadow-none print:border-none print:w-full print:max-h-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <h3 className="font-bold text-slate-900 text-lg">معاينة تقرير جرد المختبرات</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow">
                  <Printer className="w-4 h-4" /> <span>طباعة / تصدير PDF</span>
                </button>
                <button onClick={() => setPrintReportType(null)} className="text-slate-400 p-2"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="mt-6 border-2 border-slate-800 p-6 rounded-xl space-y-6">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 text-center">
                <div className="text-right text-xs space-y-1 font-semibold text-slate-700">
                  <p>وزارة التربية والتعليم</p>
                  <p>إدارة المختبرات العلمية</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">تقرير جرد المخزون والعهدة المخبرية</h2>
                  <p className="text-xs text-slate-500 mt-1">العام الدراسي: {selectedAcademicYear}</p>
                </div>
                <div className="text-left text-xs space-y-1 font-semibold text-slate-700">
                  <p>التخصص: {selectedSubject}</p>
                  <p>التاريخ: {new Date().toISOString().split("T")[0]}</p>
                </div>
              </div>
              <table className="w-full text-right text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                  <tr>
                    <th className="p-2 border-l border-slate-300 text-center">م</th>
                    <th className="p-2 border-l border-slate-300">كود الصنف</th>
                    <th className="p-2 border-l border-slate-300">اسم المادة / الأداة / الجهاز</th>
                    <th className="p-2 border-l border-slate-300">التخصص</th>
                    <th className="p-2 border-l border-slate-300">طبيعة الصنف</th>
                    <th className="p-2 border-l border-slate-300 text-center">الرصيد الفعلي</th>
                    <th className="p-2 border-l border-slate-300 text-center">حد الطلب</th>
                    <th className="p-2 text-center">الموقع بالمعمل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredItems.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="p-2 border-l border-slate-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border-l border-slate-300 font-mono">{it.id}</td>
                      <td className="p-2 border-l border-slate-300 font-semibold">{it.name}</td>
                      <td className="p-2 border-l border-slate-300">{it.subject}</td>
                      <td className="p-2 border-l border-slate-300">{it.nature === "consumable" ? "مستهلك" : "عهدة مستردة"}</td>
                      <td className="p-2 border-l border-slate-300 text-center font-bold">{it.currentStock} {it.unit}</td>
                      <td className="p-2 border-l border-slate-300 text-center">{it.minLimit} {it.unit}</td>
                      <td className="p-2 text-center text-slate-600">{it.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {printReportType === "plan" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-transparent">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto print:shadow-none print:border-none print:w-full print:max-h-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <h3 className="font-bold text-slate-900 text-lg">معاينة الخطة التشغيلية للمختبرات</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow">
                  <Printer className="w-4 h-4" /> <span>طباعة / تصدير PDF</span>
                </button>
                <button onClick={() => setPrintReportType(null)} className="text-slate-400 p-2"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="mt-6 border-2 border-slate-800 p-6 rounded-xl space-y-6">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 text-center">
                <div className="text-right text-xs space-y-1 font-semibold text-slate-700">
                  <p>وزارة التربية والتعليم</p>
                  <p>إدارة الشؤون التعليمية</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">الخطة التشغيلية وجدول تجارب المختبر</h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedSemester} | الأسبوع ({selectedWeek}) | العام الدراسي: {selectedAcademicYear}</p>
                </div>
                <div className="text-left text-xs space-y-1 font-semibold text-slate-700">
                  <p>التاريخ: {new Date().toISOString().split("T")[0]}</p>
                </div>
              </div>
              <table className="w-full text-right text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                  <tr>
                    <th className="p-2 border-l border-slate-300 text-center">اليوم</th>
                    <th className="p-2 border-l border-slate-300 text-center">الحصة</th>
                    <th className="p-2 border-l border-slate-300">الصف والشعبة</th>
                    <th className="p-2 border-l border-slate-300">المادة المقررة</th>
                    <th className="p-2 border-l border-slate-300">عنوان التجربة المعملية</th>
                    <th className="p-2 border-l border-slate-300">المعلم المنفذ</th>
                    <th className="p-2 border-l border-slate-300">أمين المختبر</th>
                    <th className="p-2 text-center">المختبر المحدد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredPlans.map((pl) => (
                    <tr key={pl.id}>
                      <td className="p-2 border-l border-slate-300 text-center font-bold">{pl.day}</td>
                      <td className="p-2 border-l border-slate-300 text-center">{pl.period}</td>
                      <td className="p-2 border-l border-slate-300 font-semibold">{pl.grade} ({pl.track}) - {pl.section}</td>
                      <td className="p-2 border-l border-slate-300">{pl.subject}</td>
                      <td className="p-2 border-l border-slate-300 font-medium text-teal-800">{pl.experimentTitle}</td>
                      <td className="p-2 border-l border-slate-300">{pl.teacherName}</td>
                      <td className="p-2 border-l border-slate-300">{pl.labTechnician}</td>
                      <td className="p-2 text-center">{pl.labRoom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {printReportType === "breakage" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-transparent">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto print:shadow-none print:border-none print:w-full print:max-h-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">فلتر الطباعة:</span>
                <select
                  value={selectedBreakageSubject}
                  onChange={(e) => setSelectedBreakageSubject(e.target.value)}
                  className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                >
                  {['الكل', 'الكيمياء', 'الفيزياء', 'الأحياء', 'العلوم العامة'].map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow">
                  <Printer className="w-4 h-4" /> <span>طباعة / تصدير PDF</span>
                </button>
                <button onClick={() => setPrintReportType(null)} className="text-slate-400 p-2"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="mt-6 border-2 border-rose-900 p-6 rounded-xl space-y-6">
              <div className="flex items-center justify-between border-b-2 border-rose-900 pb-4 text-center">
                <div className="text-right text-xs space-y-1 font-semibold text-slate-700">
                  <p>وزارة التربية والتعليم</p>
                  <p>لجنة الجرد ومتابعة العهدة</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-rose-900">محضر إثبات كسر وتلف أدوات وأجهزة مخبرية</h2>
                  <p className="text-xs text-slate-500 mt-1">كشف حوادث الكسر والتوالف الرسمية المخصومة من العهدة</p>
                </div>
                <div className="text-left text-xs space-y-1 font-semibold text-slate-700">
                  <p>تاريخ الاعتماد: {new Date().toISOString().split("T")[0]}</p>
                </div>
              </div>
              <table className="w-full text-right text-xs border border-slate-300">
                <thead className="bg-rose-50 border-b border-slate-300 text-rose-950 font-bold">
                  <tr>
                    <th className="p-2 border-l border-slate-300 text-center">رقم المحضر</th>
                    <th className="p-2 border-l border-slate-300 text-center">التاريخ</th>
                    <th className="p-2 border-l border-slate-300">المادة</th>
                    <th className="p-2 border-l border-slate-300">اسم الصنف المكسور / التالف</th>
                    <th className="p-2 border-l border-slate-300 text-center">الكمية التالفة</th>
                    <th className="p-2 border-l border-slate-300">المتسبب (الطالب / الشعبة)</th>
                    <th className="p-2 border-l border-slate-300">سبب الحادث وملاحظات السلامة</th>
                    <th className="p-2 text-center">المعلم المشرف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredBreakageRecords.map((b) => (
                    <tr key={b.id}>
                      <td className="p-2 border-l border-slate-300 text-center font-mono font-bold text-rose-700">{b.id}</td>
                      <td className="p-2 border-l border-slate-300 text-center">{b.date}</td>
                      <td className="p-2 border-l border-slate-300 font-bold text-slate-700">{b.subject}</td>
                      <td className="p-2 border-l border-slate-300 font-bold text-slate-900">{b.itemName}</td>
                      <td className="p-2 border-l border-slate-300 text-center font-bold text-rose-600">-{b.quantity}</td>
                      <td className="p-2 border-l border-slate-300 font-semibold">{b.brokenBy}</td>
                      <td className="p-2 border-l border-slate-300 text-slate-600">{b.reason}</td>
                      <td className="p-2 text-center">{b.teacherName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {printReportType === "request" && selectedRequestForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:inset-auto print:bg-white print:block">
          <style dangerouslySetInnerHTML={{__html: `
            @page {
              size: A4 portrait;
              margin: 10mm 8mm;
            }

            @media print {
              html, body {
                background: #fff !important;
              }

              .print-hide {
                display: none !important;
              }
            }
          `}} />
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 print:shadow-none print:border-none print:w-full print:p-0 print:m-0">
            <div className="print-hide flex items-center justify-between pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> <span>تم اعتماد الصرف وسياسة الاستهلاك</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handlePrintRequest} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow transition">
                  <Printer className="w-4 h-4" /> <span>طباعة / تصدير PDF</span>
                </button>
                <button onClick={() => { setPrintReportType(null); setSelectedRequestForPrint(null); }} className="text-slate-400 p-2"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div id="printable-request-area" className="mt-6 border-2 border-slate-800 p-6 rounded-xl space-y-6 print:mt-0 print:border-2 print:border-slate-900 print:shadow-none">
              
              <div className="rounded-xl border-2 border-slate-800 bg-slate-50 p-4 print:bg-white print:border-2 print:border-slate-900 print:p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-right text-[10px] font-semibold text-slate-700 leading-relaxed print:text-[10px]">
                    <p>وزارة التربية والتعليم</p>
                    <p>إدارة المختبرات والأنشطة العلمية</p>
                    <p>مختبر: {selectedRequestForPrint.subject}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full border-2 border-sky-300 bg-white shadow-sm print:h-10 print:w-10">
                      <div className="absolute inset-2 rounded-full border border-cyan-200" />
                      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400" />
                      <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-cyan-400" />
                      <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-indigo-400" />
                    </div>
                    <div className="text-center">
                      <h2 className="text-lg font-black text-slate-900 print:text-[15px]">استمارة تحضير وصرف تجربة مخبرية</h2>
                      <p className="text-[10px] font-mono font-bold text-slate-500 mt-1 print:text-[9px]">كود الاستمارة: {selectedRequestForPrint.id}</p>
                    </div>
                  </div>

                  <div className="text-left text-[10px] font-semibold text-slate-700 leading-relaxed print:text-[10px]">
                    <p>{selectedRequestForPrint.semester}</p>
                    <p>العام الدراسي: {selectedRequestForPrint.academicYear}</p>
                    <p>التاريخ: {selectedRequestForPrint.date}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-300 text-sm print:bg-slate-50">
                <div>
                  <p><span className="font-bold text-slate-900">المعلم المنفذ:</span> {selectedRequestForPrint.teacherName}</p>
                  <p className="mt-2"><span className="font-bold text-slate-900">المادة المقررة:</span> {selectedRequestForPrint.subject}</p>
                  <p className="mt-2"><span className="font-bold text-slate-900">الصف والشعبة:</span> {selectedRequestForPrint.grade} ({selectedRequestForPrint.track}) - شعبة {selectedRequestForPrint.section}</p>
                </div>
                <div>
                  <p><span className="font-bold text-slate-900">أمين المختبر المشرف:</span> {selectedRequestForPrint.labTechnician}</p>
                  <p><span className="font-bold text-slate-900">الحصة:</span> {selectedRequestForPrint.period}</p>
                  <p className="mt-2"><span className="font-bold text-slate-900">عنوان التجربة:</span> {selectedRequestForPrint.experimentTitle}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-2">1. أدوات ومواد عهدة المختبر المصروفة:</h4>
                <table className="w-full text-right text-xs border border-slate-300">
                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <tr>
                      <th className="p-2 border-l border-slate-300 text-center w-10">م</th>
                      <th className="p-2 border-l border-slate-300">اسم المادة / الأداة / الجهاز</th>
                      <th className="p-2 border-l border-slate-300 text-center">الكمية المصروفة</th>
                      <th className="p-2 border-l border-slate-300 text-center">نوع البند</th>
                      <th className="p-2 text-center">حالة الإرجاع والاستهلاك</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {selectedRequestForPrint.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-l border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border-l border-slate-300 font-semibold">{it.itemName}</td>
                        <td className="p-2 border-l border-slate-300 text-center font-bold text-slate-900">{it.quantity} {it.unit}</td>
                        <td className="p-2 border-l border-slate-300 text-center">{it.nature === "consumable" ? "مستهلك (كيماويات)" : "عهدة مستردة"}</td>
                        <td className="p-2 text-center text-slate-600">{it.nature === "consumable" ? "خُصم من الرصيد" : "يُعاد سليماً بعد الحصة"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRequestForPrint.procurements?.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-slate-900 mb-2">2. عينات ومواد تم توفيرها للتجربة (شراء خارجي):</h4>
                  <table className="w-full text-right text-xs border border-slate-300">
                    <thead className="bg-emerald-50 border-b border-slate-300 text-emerald-900 font-bold">
                      <tr>
                        <th className="p-2 border-l border-slate-300 text-center w-10">م</th>
                        <th className="p-2 border-l border-slate-300">اسم المادة / العينة الطازجة</th>
                        <th className="p-2 border-l border-slate-300 text-center">الكمية المطلوبة</th>
                        <th className="p-2 text-center">جهة التأمين والتوفير</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {selectedRequestForPrint.procurements.map((prc, pidx) => (
                        <tr key={pidx}>
                          <td className="p-2 border-l border-slate-300 text-center font-bold">{pidx + 1}</td>
                          <td className="p-2 border-l border-slate-300 font-semibold">{prc.name}</td>
                          <td className="p-2 border-l border-slate-300 text-center font-bold">{prc.quantity}</td>
                          <td className="p-2 text-center text-slate-700 font-medium">{prc.providedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-center text-xs">
                <div><p className="font-bold text-slate-900 mb-8">توقيع المعلم المنفذ</p><p className="text-slate-400">..............................</p></div>
                <div><p className="font-bold text-slate-900 mb-8">توقيع واعتماد أمين المختبر</p><p className="text-slate-400">..............................</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}