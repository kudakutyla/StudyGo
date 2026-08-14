"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, CalendarClock, CheckCircle2, CircleDashed, Loader2, LogOut, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Assignment, DashboardStats, deleteAssignment, getAssignments, getCurrentUser, getDashboardStats, logout, updateAssignment, updateAssignmentStatus, createAssignment } from "@/lib/api";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"] as const;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: Assignment["status"]) {
  const map = {
    PENDING: "bg-[#f3e2d8] text-[#4e413b]",
    IN_PROGRESS: "bg-[#eadcca] text-[#3f312b]",
    COMPLETED: "bg-[#dfe9d8] text-[#2f4b35]",
  } as const;

  return map[status] || "bg-[#f3e2d8] text-[#4e413b]";
}

function getPriorityBadge(priority: Assignment["priority"]) {
  const map = {
    LOW: "bg-[#efe4d7] text-[#4f433d]",
    MEDIUM: "bg-[#f0deb1] text-[#5a4222]",
    HIGH: "bg-[#f1d1d1] text-[#613a3a]",
  } as const;

  return map[priority] || "bg-[#efe4d7] text-[#4f433d]";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingStatusFilter, setPendingStatusFilter] = useState("all");
  const [pendingPriorityFilter, setPendingPriorityFilter] = useState("all");
  const [pendingSortBy, setPendingSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [activePanel, setActivePanel] = useState<"dashboard" | "profile" | "settings">("dashboard");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [form, setForm] = useState({
    title: "",
    course: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM" as Assignment["priority"],
    status: "PENDING" as Assignment["status"],
  });

  const loadUserAndStats = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const summary = await getDashboardStats();
      setStats(summary);
    } catch {
      router.push("/login");
    }
  };

  const loadAssignments = async (override?: {
    searchValue?: string;
    statusValue?: string;
    priorityValue?: string;
    sortValue?: string;
    pageValue?: number;
  }) => {
    const nextSearch = override?.searchValue ?? search;
    const nextStatus = override?.statusValue ?? statusFilter;
    const nextPriority = override?.priorityValue ?? priorityFilter;
    const nextSort = override?.sortValue ?? sortBy;
    const nextPage = override?.pageValue ?? page;

    setAssignmentLoading(true);
    try {
      const result = await getAssignments({
        search: nextSearch || undefined,
        status: normalizeFilterValue(nextStatus),
        priority: normalizeFilterValue(nextPriority),
        sort: nextSort,
        page: nextPage,
        limit: 8,
      });
      setAssignments(result.assignments);
    } catch {
      setError("Unable to load assignments.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await loadUserAndStats();
      setLoading(false);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("studygo-theme");
    if (savedTheme === "dark") {
      setThemeMode("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    window.localStorage.setItem("studygo-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    loadAssignments();
  }, [search, statusFilter, priorityFilter, sortBy, page]);

  useEffect(() => {
    if (!stats) {
      setStatsLoading(true);
      return;
    }
    setStatsLoading(false);
  }, [stats]);

  const openCreateModal = () => {
    setEditingAssignment(null);
    setForm({
      title: "",
      course: "",
      description: "",
      dueDate: new Date().toISOString().slice(0, 10),
      priority: "MEDIUM",
      status: "PENDING",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setForm({
      title: assignment.title,
      course: assignment.course,
      description: assignment.description,
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 10),
      priority: assignment.priority,
      status: assignment.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    try {
      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, form);
      } else {
        await createAssignment(form);
      }
      setIsModalOpen(false);
      await loadAssignments();
      const summary = await getDashboardStats();
      setStats(summary);
    } catch {
      setError("Unable to create assignment.");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this assignment?");
    if (!confirmed) return;

    try {
      await deleteAssignment(id);
      await loadAssignments();
      const summary = await getDashboardStats();
      setStats(summary);
    } catch {
      setError("Unable to delete assignment.");
    }
  };

  const handleStatusChange = async (id: string, nextStatus: Assignment["status"]) => {
    try {
      await updateAssignmentStatus(id, nextStatus);
      await loadAssignments();
      const summary = await getDashboardStats();
      setStats(summary);
    } catch {
      setError("Unable to update assignment status.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const normalizeFilterValue = (value: string) => {
    if (!value || value === "all") return undefined;
    return value.trim().replace(/[-\s]+/g, "_").toUpperCase();
  };

  const applyFilters = () => {
    const nextSearch = pendingSearch.trim();
    const nextStatus = pendingStatusFilter;
    const nextPriority = pendingPriorityFilter;
    const nextSortBy = pendingSortBy;

    setSearch(nextSearch);
    setStatusFilter(nextStatus);
    setPriorityFilter(nextPriority);
    setSortBy(nextSortBy);
    setPage(1);

    void loadAssignments({
      searchValue: nextSearch,
      statusValue: nextStatus,
      priorityValue: nextPriority,
      sortValue: nextSortBy,
      pageValue: 1,
    });
  };

  const resetFilters = () => {
    const resetSearch = "";
    const resetStatus = "all";
    const resetPriority = "all";
    const resetSort = "newest";

    setPendingSearch(resetSearch);
    setPendingStatusFilter(resetStatus);
    setPendingPriorityFilter(resetPriority);
    setPendingSortBy(resetSort);
    setSearch(resetSearch);
    setStatusFilter(resetStatus);
    setPriorityFilter(resetPriority);
    setSortBy(resetSort);
    setPage(1);

    void loadAssignments({
      searchValue: resetSearch,
      statusValue: resetStatus,
      priorityValue: resetPriority,
      sortValue: resetSort,
      pageValue: 1,
    });
  };

  const goToAssignmentsView = () => {
    const resetSearch = "";
    const resetStatus = "all";
    const resetPriority = "all";
    const resetSort = "newest";

    setActivePanel("dashboard");
    setPendingSearch(resetSearch);
    setPendingStatusFilter(resetStatus);
    setPendingPriorityFilter(resetPriority);
    setPendingSortBy(resetSort);
    setSearch(resetSearch);
    setStatusFilter(resetStatus);
    setPriorityFilter(resetPriority);
    setSortBy(resetSort);
    setPage(1);

    void loadAssignments({
      searchValue: resetSearch,
      statusValue: resetStatus,
      priorityValue: resetPriority,
      sortValue: resetSort,
      pageValue: 1,
    });

    window.requestAnimationFrame(() => {
      const section = document.getElementById("assignments");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    sortBy !== "newest";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const shellClass = themeMode === "dark" ? "dashboard-shell dark-theme" : "dashboard-shell";
  const panelClass = themeMode === "dark" ? "dashboard-card dark-panel" : "dashboard-card";
  const mutedTextClass = themeMode === "dark" ? "dashboard-muted dark-muted" : "dashboard-muted";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f3ee]">
        <div className="flex items-center gap-2 text-[#3f312b]"><Loader2 className="h-5 w-5 animate-spin" /> Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#eadcca] bg-[#f4efe9] p-6 md:block">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8d7c1] text-[#3f312b] font-bold">S</div>
          <div>
            <p className="text-xl font-semibold">StudyGo</p>
          </div>
        </div>

        <nav className="space-y-2">
          <button type="button" onClick={() => {
            setActivePanel("dashboard");
            setPendingSearch("");
            setPendingStatusFilter("all");
            setPendingPriorityFilter("all");
            setPendingSortBy("newest");
            setSearch("");
            setStatusFilter("all");
            setPriorityFilter("all");
            setSortBy("newest");
            setPage(1);
            void loadAssignments({
              searchValue: "",
              statusValue: "all",
              priorityValue: "all",
              sortValue: "newest",
              pageValue: 1,
            });
          }} className={`flex w-full items-center rounded-xl px-4 py-3 text-left ${activePanel === "dashboard" ? "bg-[#efe4d7] font-medium text-[#2d241f]" : "text-[#4e413b] hover:bg-[#f3eadf]"}`}>
            Dashboard
          </button>
          <button type="button" onClick={goToAssignmentsView} className="flex w-full items-center rounded-xl px-4 py-3 text-left text-[#4e413b] hover:bg-[#f3eadf]">
            Assignments
          </button>
          <button type="button" onClick={() => setActivePanel("profile")} className={`flex w-full items-center rounded-xl px-4 py-3 text-left ${activePanel === "profile" ? "bg-[#efe4d7] font-medium text-[#2d241f]" : "text-[#4e413b] hover:bg-[#f3eadf]"}`}>
            Profile
          </button>
          <button type="button" onClick={() => setActivePanel("settings")} className={`flex w-full items-center rounded-xl px-4 py-3 text-left ${activePanel === "settings" ? "bg-[#efe4d7] font-medium text-[#2d241f]" : "text-[#4e413b] hover:bg-[#f3eadf]"}`}>
            Settings
          </button>
          <button type="button" onClick={handleLogout} className="flex w-full items-center rounded-xl px-4 py-3 text-left text-[#4e413b] hover:bg-[#f3eadf]">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </button>
        </nav>
      </aside>

      <main className="md:ml-72">
        <header className="border-b border-[#eadcca] bg-[#f8f3ee]/80 px-6 py-5 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[#7b655d]">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-[#1f1a17]">{greeting}, {user?.name || "Student"} 👋</h1>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-full bg-[#3f312b] px-5 py-3 text-sm font-medium text-white shadow-soft hover:bg-[#2c231f]"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Assignment
            </button>
          </div>
        </header>

        {activePanel === "profile" ? (
          <div className="space-y-6 p-6">
            <div className={panelClass}>
              <div className="flex items-center gap-4 border-b border-[#eadcca] pb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8d7c1] text-2xl font-semibold text-[#3f312b]">
                  {user?.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div>
                  <p className={mutedTextClass}>Profile</p>
                  <h2 className="text-2xl font-semibold text-[#1f1a17]">{user?.name || "Student"}</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className={panelClass}>
                  <p className={mutedTextClass}>Full name</p>
                  <p className="mt-2 text-lg font-medium text-[#1f1a17]">{user?.name || "Not available"}</p>
                </div>
                <div className={panelClass}>
                  <p className={mutedTextClass}>Email</p>
                  <p className="mt-2 text-lg font-medium text-[#1f1a17]">{user?.email || "Not available"}</p>
                </div>
                <div className={panelClass}>
                  <p className={mutedTextClass}>User ID</p>
                  <p className="mt-2 text-lg font-medium text-[#1f1a17]">{user?.id || "Not available"}</p>
                </div>
                <div className={panelClass}>
                  <p className={mutedTextClass}>Account</p>
                  <p className="mt-2 text-lg font-medium text-[#1f1a17]">Active</p>
                </div>
              </div>
            </div>
          </div>
        ) : activePanel === "settings" ? (
          <div className="space-y-6 p-6">
            <div className={panelClass}>
              <div className="mb-4">
                <p className={mutedTextClass}>Appearance</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#1f1a17]">Theme preferences</h2>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setThemeMode("light")}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${themeMode === "light" ? "border-[#3f312b] bg-[#3f312b] text-white" : "border-[#d9cab8] bg-white text-[#3f312b]"}`}
                >
                  Light mode
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode("dark")}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${themeMode === "dark" ? "border-[#3f312b] bg-[#3f312b] text-white" : "border-[#d9cab8] bg-white text-[#3f312b]"}`}
                >
                  Dark mode
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <p className="text-[#4e413b]">Here&apos;s what&apos;s happening with your assignments.</p>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              {statsLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="rounded-2xl border border-[#eadcca] bg-white p-4 animate-pulse"><div className="h-4 w-16 rounded bg-[#f0e7df]" /><div className="mt-4 h-8 w-12 rounded bg-[#f0e7df]" /></div>
                ))
              ) : stats ? (
                [
                  { label: "Total Assignments", value: stats.total },
                  { label: "Pending", value: stats.pending },
                  { label: "In Progress", value: stats.inProgress },
                  { label: "Completed", value: stats.completed },
                  { label: "Overdue", value: stats.overdue },
                  { label: "High Priority", value: stats.highPriority },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#eadcca] bg-white p-4 shadow-soft">
                    <p className="text-sm text-[#65554d]">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-[#1f1a17]">{item.value}</p>
                  </div>
                ))
              ) : null}
            </div>

            <div id="assignments" className="rounded-[2rem] border border-[#eadcca] bg-white p-5 shadow-soft">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74645d]" />
                  <input
                    value={pendingSearch}
                    onChange={(e) => setPendingSearch(e.target.value)}
                    placeholder="Search assignments..."
                    className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] py-2.5 pl-10 pr-3 text-[#1f1a17] outline-none focus:border-[#b7835a]"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select value={pendingStatusFilter} onChange={(e) => setPendingStatusFilter(e.target.value)} className="rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5 text-[#1f1a17]">
                    <option value="all">All status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select value={pendingPriorityFilter} onChange={(e) => setPendingPriorityFilter(e.target.value)} className="rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5 text-[#1f1a17]">
                    <option value="all">All priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <select value={pendingSortBy} onChange={(e) => setPendingSortBy(e.target.value)} className="rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5 text-[#1f1a17]">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                  </select>
                  <button type="button" onClick={applyFilters} className="rounded-xl bg-[#3f312b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d241f]">
                    Apply filters
                  </button>
                  <button type="button" onClick={resetFilters} className="rounded-xl border border-[#d9cab8] bg-white px-4 py-2.5 text-sm font-medium text-[#3f312b] hover:bg-[#f9f5f2]">
                    Reset
                  </button>
                </div>
              </div>

              {assignmentLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-52 animate-pulse rounded-2xl border border-[#eadcca] bg-[#f5f0ea]" />
                  ))}
                </div>
              ) : assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#d4be9b] bg-[#faf5f1] px-6 py-16 text-center">
                  <AlertCircle className="mb-4 h-10 w-10 text-[#6d5648]" />
                  <p className="text-2xl font-semibold text-[#1f1a17]">
                    {hasActiveFilters ? "No assignments match your filters." : "No assignments yet."}
                  </p>
                  <p className="mt-2 text-[#5e4a3f]">
                    {hasActiveFilters
                      ? "Try a different search or reset the filters to see everything again."
                      : "Start adding your assignments to stay organized."}
                  </p>
                  {hasActiveFilters ? (
                    <button type="button" onClick={resetFilters} className="mt-6 inline-flex items-center justify-center rounded-full bg-[#3f312b] px-5 py-3 text-sm font-medium text-white hover:bg-[#2d241f]">
                      Reset filters
                    </button>
                  ) : (
                    <button type="button" onClick={openCreateModal} className="mt-6 inline-flex items-center justify-center rounded-full bg-[#3f312b] px-5 py-3 text-sm font-medium text-white hover:bg-[#2d241f]">
                      <Plus className="mr-2 h-4 w-4" /> Add Assignment
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {assignments.map((assignment) => {
                    const overdue = new Date(assignment.dueDate) < new Date() && assignment.status !== "COMPLETED";

                    return (
                      <div key={assignment.id} className={`rounded-2xl border p-5 shadow-soft ${overdue ? "border-[#e7b7b5] bg-[#fff8f7]" : "border-[#eadcca] bg-[#fffdfb]"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-[#1f1a17]">{assignment.title}</h3>
                            <p className="mt-1 text-sm text-[#65554d]">{assignment.course}</p>
                          </div>
                          <button type="button" onClick={() => handleDeleteAssignment(assignment.id)} className="text-[#7b655d] hover:text-[#3f312b]" aria-label="Delete assignment">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-[#4e413b]">{assignment.description}</p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityBadge(assignment.priority)}`}>{assignment.priority}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(assignment.status)}`}>{assignment.status.replace("_", " ")}</span>
                          {overdue ? <span className="rounded-full bg-[#f1d1d1] px-2.5 py-1 text-xs font-medium text-[#613a3a]">Overdue</span> : null}
                        </div>

                        <div className="mt-5 flex items-center justify-between text-sm text-[#4e413b]">
                          <span className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4" /> {formatDate(assignment.dueDate)}</span>
                          <button type="button" onClick={() => openEditModal(assignment)} className="inline-flex items-center gap-1 text-[#3f312b]">
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                        </div>

                        <div className="mt-5">
                          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-[#7b655d]">Status</label>
                          <select
                            value={assignment.status}
                            onChange={(e) => handleStatusChange(assignment.id, e.target.value as Assignment["status"])}
                            className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5 text-sm text-[#1f1a17]"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>{status.replace("_", " ")}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1a17]/30 p-4">
          <div className="w-full max-w-xl rounded-[2rem] border border-[#eadcca] bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#1f1a17]">{editingAssignment ? "Edit assignment" : "Add assignment"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close modal" className="text-[#6d5648]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#2d241f]">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2d241f]">Course</label>
                <input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2d241f]">Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2d241f]">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Assignment["priority"] })} className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5">
                  {PRIORITY_OPTIONS.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2d241f]">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Assignment["status"] })} className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5">
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#2d241f]">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-xl border border-[#d9cab8] bg-[#f9f5f2] px-3 py-2.5" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full border border-[#d9cab8] bg-white px-5 py-2.5 text-[#3f312b]">Cancel</button>
              <button type="button" onClick={handleSaveAssignment} className="rounded-full bg-[#3f312b] px-5 py-2.5 text-white hover:bg-[#2d241f]">Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
