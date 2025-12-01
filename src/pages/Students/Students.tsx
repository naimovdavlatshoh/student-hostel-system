import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomPagination from "@/components/ui/custom-pagination";
import SearchInput from "@/components/ui/search-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import CustomBreadcrumb from "@/components/ui/custom-breadcrumb";
import { useEffect, useState, useRef } from "react";
import { CiTrash } from "react-icons/ci";
import { HiDotsVertical } from "react-icons/hi";
import { GrEdit } from "react-icons/gr";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/ui/custom-modal";
import { toast } from "sonner";
import { IoMdAdd } from "react-icons/io";
import { GetDataSimple, DeleteData, PostDataTokenJson } from "@/services/data";
import { FiUploadCloud } from "react-icons/fi";

interface Student {
    student_id: number;
    user_id: number;
    student_name: string;
    student_surname: string;
    student_fathername: string;
    passport_series: string;
    date_of_birth: string;
    region_id: number;
    region_name: string;
    district_id: number;
    district_name: string;
    phone_number: string;
    owner_additional_phone_number: string | null;
    additional_phone_number: string | null;
    university_name: string;
    course_level: number;
    university_group_name: string | null;
    document_full_path: string;
    available_in_terminal: number;
    available_in_terminal_text: string;
    is_blocked: number;
    is_blocked_text: string;
    is_active: number;
    created_at: string;
    updated_at: string | null;
}

interface ApiResponse {
    page: number;
    limit: number;
    count: number;
    pages: number;
    result: Student[];
}

const Students = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [counts, setCounts] = useState({
        all: 0,
        active: 0,
        blocked: 0,
    });

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [studentToUpload, setStudentToUpload] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);

    const fetchStudents = async (
        page: number = 1,
        limit: number = 10,
        isBlocked?: number
    ) => {
        try {
            const blockedParam =
                isBlocked !== undefined ? `&is_blocked=${isBlocked}` : "";
            const data: ApiResponse = await GetDataSimple(
                `api/student/list?page=${page}&limit=${limit}${blockedParam}`
            );

            setStudents(data.result);
            setTotalPages(data.pages);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Ошибка загрузки студентов");
        }
    };

    const fetchCounts = async () => {
        try {
            // Fetch all students count
            const allRes = await GetDataSimple(
                `api/student/list?page=1&limit=1`
            );
            // Fetch active students count
            const activeRes = await GetDataSimple(
                `api/student/list?page=1&limit=1&is_blocked=0`
            );
            // Fetch blocked students count
            const blockedRes = await GetDataSimple(
                `api/student/list?page=1&limit=1&is_blocked=1`
            );

            setCounts({
                all: allRes?.count || 0,
                active: activeRes?.count || 0,
                blocked: blockedRes?.count || 0,
            });
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    };

    const searchStudents = async (keyword: string) => {
        if (keyword.length < 3) {
            // If keyword is less than 3 characters, fetch students based on active tab
            const isBlocked =
                activeTab === "active"
                    ? 0
                    : activeTab === "blocked"
                    ? 1
                    : undefined;
            fetchStudents(currentPage, itemsPerPage, isBlocked);
            return;
        }

        try {
            setIsSearching(true);
            const encodedKeyword = encodeURIComponent(keyword);
            const response = await GetDataSimple(
                `api/student/search?keyword=${encodedKeyword}`
            );

            // Filter search results based on active tab
            let filteredResults = response?.result || response || [];
            if (activeTab === "active") {
                filteredResults = filteredResults.filter(
                    (student: Student) => student.is_blocked === 0
                );
            } else if (activeTab === "blocked") {
                filteredResults = filteredResults.filter(
                    (student: Student) => student.is_blocked === 1
                );
            }

            setStudents(filteredResults);
            setTotalPages(1); // Search results are typically on one page
        } catch (error) {
            console.error("Error searching students:", error);
            toast.error("Ошибка поиска студентов");
        } finally {
            setIsSearching(false);
        }
    };

    // Use students directly since we're doing server-side search
    const currentStudents = students;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const isBlocked =
            activeTab === "active"
                ? 0
                : activeTab === "blocked"
                ? 1
                : undefined;
        fetchStudents(page, itemsPerPage, isBlocked);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setCurrentPage(1);
        setSearchQuery("");
        const isBlocked =
            value === "active" ? 0 : value === "blocked" ? 1 : undefined;
        fetchStudents(1, itemsPerPage, isBlocked);
    };

    const handleItemsPerPageChange = (value: string) => {
        const newLimit = Number(value);
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        const isBlocked =
            activeTab === "active"
                ? 0
                : activeTab === "blocked"
                ? 1
                : undefined;
        fetchStudents(1, newLimit, isBlocked);
    };

    // Debounced search handler
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        // Clear any existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set a new timeout for search
        searchTimeoutRef.current = setTimeout(() => {
            searchStudents(value);
        }, 100); // 100ms delay
    };

    const handleSelectUser = (studentId: number) => {
        setSelectedUsers((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers?.length === currentStudents?.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(
                currentStudents?.map((student) => student.student_id)
            );
        }
    };

    const openDeleteModal = (user: { id: number; name: string }) => {
        setUserToDelete({ id: user.id, name: user.name });
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await DeleteData(`api/student/delete/${userToDelete.id}`);
            toast.success("Студент удалён", {
                description: `${userToDelete.name} успешно удалён.`,
                duration: 2500,
            });

            // Refresh students list after deletion
            const isBlocked =
                activeTab === "active"
                    ? 0
                    : activeTab === "blocked"
                    ? 1
                    : undefined;
            fetchStudents(currentPage, itemsPerPage, isBlocked);
            fetchCounts(); // Refresh counts

            setIsDeleteOpen(false);
            setUserToDelete(null);
        } catch (error: any) {
            console.error("Error deleting student:", error);
            toast.error(
                error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    "Ошибка удаления студента"
            );
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteOpen(false);
        setUserToDelete(null);
    };

    const openUploadModal = (student: { id: number; name: string }) => {
        setStudentToUpload({ id: student.id, name: student.name });
        setIsUploadOpen(true);
    };

    const handleConfirmUpload = async () => {
        if (!studentToUpload) return;

        try {
            await PostDataTokenJson(
                `api/student/${studentToUpload.id}/upload-faceid`,
                {}
            );
            toast.success("Студент загружен в терминал", {
                description: `${studentToUpload.name} успешно загружен.`,
                duration: 2500,
            });

            // Refresh students list after upload
            const isBlocked =
                activeTab === "active"
                    ? 0
                    : activeTab === "blocked"
                    ? 1
                    : undefined;
            fetchStudents(currentPage, itemsPerPage, isBlocked);
            fetchCounts(); // Refresh counts

            setIsUploadOpen(false);
            setStudentToUpload(null);
        } catch (error: any) {
            console.error("Error uploading student:", error);
            toast.error(
                error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    "Ошибка загрузки студента в терминал"
            );
        }
    };

    const handleCancelUpload = () => {
        setIsUploadOpen(false);
        setStudentToUpload(null);
    };

    useEffect(() => {
        fetchCounts();
        fetchStudents(currentPage, itemsPerPage); // Default: all students
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-6">
            <div className="space-y-4 mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl  font-semibold text-gray-900 ">
                            Все Студенты
                        </h1>
                    </div>
                    <Link to="/users/create">
                        <Button className="bg-black text-white duration-300 hover:bg-black/70 rounded-xl ">
                            <IoMdAdd className="w-3 h-3" /> Добавить
                        </Button>
                    </Link>
                </div>
                {/* <CustomBreadcrumb
                    items={[
                        { label: "Панель управления", href: "/" },
                        { label: "Сотрудники", isActive: true },
                    ]}
                /> */}
            </div>

            <Card className="bg-white  rounded-2xl shadow-lg border border-gray-100 ">
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-start w-full">
                            <SearchInput
                                placeholder="Поиск студентов..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>

                        {/* Status Tabs */}
                        <Tabs
                            value={activeTab}
                            onValueChange={handleTabChange}
                            className="w-full"
                        >
                            <TabsList className="bg-transparent p-0 h-auto gap-2 border-b border-gray-200 rounded-none w-full justify-start">
                                <TabsTrigger
                                    value="all"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-2 font-medium text-gray-500 hover:text-gray-700"
                                >
                                    Все{" "}
                                    <span className="ml-2 px-2 py-0.5 rounded-sm bg-gray-200 text-gray-700 text-xs font-semibold">
                                        {counts.all}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="active"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-4 py-2 font-medium text-gray-500 hover:text-gray-700"
                                >
                                    Активные{" "}
                                    <span className="ml-2 px-2 py-0.5 rounded-sm bg-green-100 text-green-700 text-xs font-semibold">
                                        {counts.active}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="blocked"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none px-4 py-2 font-medium text-gray-500 hover:text-gray-700"
                                >
                                    Заблокированные{" "}
                                    <span className="ml-2 px-2 py-0.5 rounded-sm bg-red-100 text-red-700 text-xs font-semibold">
                                        {counts.blocked}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table className="table-auto w-full">
                        <TableHeader className="bg-mainbg/10 ">
                            <TableRow>
                                <TableHead className="text-maintx ">
                                    <Checkbox
                                        checked={
                                            selectedUsers?.length ===
                                                currentStudents?.length &&
                                            currentStudents?.length > 0
                                        }
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-maintx break-words whitespace-normal min-w-0 max-w-xs">
                                    Студент
                                </TableHead>
                                <TableHead className="text-maintx break-words whitespace-normal min-w-0 max-w-xs">
                                    Паспорт
                                </TableHead>
                                <TableHead className="text-maintx break-words whitespace-normal min-w-0 max-w-xs">
                                    Телефон
                                </TableHead>
                                <TableHead className="text-maintx break-words whitespace-normal min-w-0 max-w-xs">
                                    Университет
                                </TableHead>
                                <TableHead className="text-maintx break-words whitespace-normal min-w-0 max-w-xs">
                                    Курс
                                </TableHead>
                                <TableHead className="text-maintx break-words whitespace-normal min-w-0 max-w-xs">
                                    Регион
                                </TableHead>
                                <TableHead className="text-right text-maintx ">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isSearching ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center py-8"
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span className="text-gray-500">
                                                Поиск...
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : currentStudents?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {searchQuery
                                            ? "Студенты не найдены"
                                            : "Нет студентов"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentStudents?.map((student) => (
                                    <TableRow
                                        key={student.student_id}
                                        className="border-dashed border-gray-200  hover:bg-gray-100 "
                                    >
                                        <TableCell className="w-12">
                                            <Checkbox
                                                checked={selectedUsers.includes(
                                                    student.student_id
                                                )}
                                                onCheckedChange={() =>
                                                    handleSelectUser(
                                                        student.student_id
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-gray-600 break-words whitespace-normal min-w-0 max-w-xs">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-maintx flex-shrink-0">
                                                    <img
                                                        src={
                                                            student?.document_full_path
                                                                ? student?.document_full_path
                                                                : "/avatar-1.webp"
                                                        }
                                                        alt={""}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        to={`/details/${student.student_id}`}
                                                        className="text-sm font-medium text-gray-900  hover:underline cursor-pointer transition-all duration-200 break-words"
                                                    >
                                                        {
                                                            student.student_surname
                                                        }{" "}
                                                        {student.student_name}{" "}
                                                        {
                                                            student.student_fathername
                                                        }
                                                    </Link>
                                                    <div className="mt-1">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold ${
                                                                student.available_in_terminal ===
                                                                1
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }`}
                                                        >
                                                            {student.available_in_terminal_text ||
                                                                (student.available_in_terminal ===
                                                                1
                                                                    ? "Лицо загружено в терминал"
                                                                    : "Не загружено")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600 break-words whitespace-normal min-w-0 max-w-xs">
                                            {student.passport_series || "—"}
                                        </TableCell>
                                        <TableCell className="text-gray-600 break-words whitespace-normal min-w-0 max-w-xs">
                                            {student.phone_number || "—"}
                                        </TableCell>
                                        <TableCell className="text-gray-600 break-words whitespace-normal min-w-0 max-w-xs">
                                            {student.university_name || "—"}
                                        </TableCell>
                                        <TableCell className="text-gray-600 break-words whitespace-normal min-w-0 max-w-xs">
                                            {student.course_level || "—"}
                                        </TableCell>
                                        <TableCell className="text-gray-600 break-words whitespace-normal min-w-0 max-w-xs">
                                            {student.region_name},{" "}
                                            {student.district_name}
                                        </TableCell>

                                        <TableCell className="text-right whitespace-nowrap">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="rounded-full outline-none focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 hover:bg-gray-200 p-2 transition-colors duration-200">
                                                        <HiDotsVertical className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link
                                                        to={`/user/${student.student_id}`}
                                                    >
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                            <GrEdit className="w-4 h-4" />
                                                            <span>
                                                                Редактировать
                                                            </span>
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 cursor-pointer"
                                                        disabled={
                                                            student.available_in_terminal ===
                                                            1
                                                        }
                                                        onClick={() =>
                                                            openUploadModal({
                                                                id: student.student_id,
                                                                name: `${student.student_surname} ${student.student_name}`,
                                                            })
                                                        }
                                                    >
                                                        <FiUploadCloud className="w-4 h-4" />
                                                        <span>Загрузить</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 text-red-600 hover:text-red-600"
                                                        onClick={() =>
                                                            openDeleteModal({
                                                                id: student.student_id,
                                                                name: `${student.student_surname} ${student.student_name}`,
                                                            })
                                                        }
                                                    >
                                                        <CiTrash className="w-4 h-4" />
                                                        <span>Удалить</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-gray-200  pt-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="" className="text-gray-500 text-sm">
                            Строк на странице:
                        </label>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={handleItemsPerPageChange}
                        >
                            <SelectTrigger className="w-16 h-8 border-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </CardFooter>
            </Card>
            {/* Delete Confirmation Modal */}
            <CustomModal
                showTrigger={false}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Подтверждение удаления"
                confirmText="Удалить"
                cancelText="Отмена"
                confirmBg="bg-red-500"
                confirmBgHover="bg-red-500/70"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                size="md"
                showCloseButton={false}
            >
                <div className="space-y-2">
                    <p className="text-sm text-gray-600 ">
                        Вы уверены, что хотите удалить студента{" "}
                        <span className="font-semibold text-gray-900 ">
                            {userToDelete?.name}
                        </span>
                        ? Это действие нельзя отменить.
                    </p>
                </div>
            </CustomModal>

            {/* Upload Confirmation Modal */}
            <CustomModal
                showTrigger={false}
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                title="Загрузка в терминал"
                confirmText="Да"
                cancelText="Отмена"
                confirmBg="bg-maintx"
                confirmBgHover="bg-maintx/80"
                onConfirm={handleConfirmUpload}
                onCancel={handleCancelUpload}
                size="md"
                showCloseButton={false}
            >
                <div className="space-y-2">
                    <p className="text-sm text-gray-600 ">
                        Вы хотите загрузить этого студента в терминал{" "}
                        <span className="font-semibold text-gray-900 ">
                            {studentToUpload?.name}
                        </span>
                        ?
                    </p>
                </div>
            </CustomModal>
        </div>
    );
};

export default Students;
