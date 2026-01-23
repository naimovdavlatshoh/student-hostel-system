import { useEffect, useState, useRef } from "react";
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
// import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomPagination from "@/components/ui/custom-pagination";
import SearchInput from "@/components/ui/search-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CiTrash } from "react-icons/ci";
import { HiDotsVertical } from "react-icons/hi";
import { GrEdit } from "react-icons/gr";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/ui/custom-modal";
import { IoMdAdd } from "react-icons/io";
import { FiUploadCloud } from "react-icons/fi";
import {
    Student,
    Counts,
    fetchStudents,
    fetchCounts,
    searchStudents,
    deleteStudent,
    uploadStudentToTerminal,
} from "./data";

const Students = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    // const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [counts, setCounts] = useState<Counts>({
        all: 0,
        active: 0,
        blocked: 0,
        not_uploaded: 0,
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
    const [loading, setLoading] = useState(true);
    const searchTimeoutRef = useRef<number | null>(null);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        null
    );
    const [selectedImageTitle, setSelectedImageTitle] = useState<string>("");

    const loadStudents = async (
        page: number,
        limit: number,
        isBlocked?: number,
        availableInTerminal?: number
    ) => {
        try {
            const { students: fetchedStudents, totalPages: fetchedTotalPages } =
                await fetchStudents(page, limit, isBlocked, availableInTerminal);
            setStudents(fetchedStudents);
            setTotalPages(fetchedTotalPages);
        } catch (error) {
            console.error("Error loading students:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCounts = async () => {
        const fetchedCounts = await fetchCounts();
        setCounts(fetchedCounts);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const isBlocked =
            activeTab === "active"
                ? 0
                : activeTab === "blocked"
                ? 1
                : undefined;
        const availableInTerminal = activeTab === "not_uploaded" ? 0 : undefined;
        setLoading(true);
        loadStudents(page, itemsPerPage, isBlocked, availableInTerminal);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setCurrentPage(1);
        setSearchQuery("");
        setLoading(true);
        const isBlocked =
            value === "active" ? 0 : value === "blocked" ? 1 : undefined;
        const availableInTerminal = value === "not_uploaded" ? 0 : undefined;
        loadStudents(1, itemsPerPage, isBlocked, availableInTerminal);
    };

    const handleItemsPerPageChange = (value: string) => {
        const newLimit = Number(value);
        setItemsPerPage(newLimit);
        setCurrentPage(1);
        setLoading(true);
        const isBlocked =
            activeTab === "active"
                ? 0
                : activeTab === "blocked"
                ? 1
                : undefined;
        const availableInTerminal = activeTab === "not_uploaded" ? 0 : undefined;
        loadStudents(1, newLimit, isBlocked, availableInTerminal);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            if (value.length < 3) {
                const isBlocked =
                    activeTab === "active"
                        ? 0
                        : activeTab === "blocked"
                        ? 1
                        : undefined;
                const availableInTerminal = activeTab === "not_uploaded" ? 0 : undefined;
                setLoading(true);
                loadStudents(currentPage, itemsPerPage, isBlocked, availableInTerminal);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchStudents(value, activeTab);
                setStudents(results);
                setTotalPages(1);
            } finally {
                setIsSearching(false);
            }
        }, 100);
    };

    // const handleSelectUser = (studentId: number) => {
    //     setSelectedUsers((prev) =>
    //         prev.includes(studentId)
    //             ? prev.filter((id) => id !== studentId)
    //             : [...prev, studentId]
    //     );
    // };

    // const handleSelectAll = () => {
    //     if (selectedUsers?.length === students?.length) {
    //         setSelectedUsers([]);
    //     } else {
    //         setSelectedUsers(students?.map((student) => student.student_id));
    //     }
    // };

    const openDeleteModal = (user: { id: number; name: string }) => {
        setUserToDelete({ id: user.id, name: user.name });
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await deleteStudent(userToDelete.id);
            const isBlocked =
                activeTab === "active"
                    ? 0
                    : activeTab === "blocked"
                    ? 1
                    : undefined;
            const availableInTerminal = activeTab === "not_uploaded" ? 0 : undefined;
            setLoading(true);
            await Promise.all([
                loadStudents(currentPage, itemsPerPage, isBlocked, availableInTerminal),
                loadCounts(),
            ]);
            setIsDeleteOpen(false);
            setUserToDelete(null);
        } catch (error) {
            // Error already handled in data.ts
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
            await uploadStudentToTerminal(studentToUpload.id);
            const isBlocked =
                activeTab === "active"
                    ? 0
                    : activeTab === "blocked"
                    ? 1
                    : undefined;
            const availableInTerminal = activeTab === "not_uploaded" ? 0 : undefined;
            setLoading(true);
            await Promise.all([
                loadStudents(currentPage, itemsPerPage, isBlocked, availableInTerminal),
                loadCounts(),
            ]);
            setIsUploadOpen(false);
            setStudentToUpload(null);
        } catch (error) {
            // Error already handled in data.ts
        }
    };

    const handleCancelUpload = () => {
        setIsUploadOpen(false);
        setStudentToUpload(null);
    };

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            const isBlocked = undefined; // All students on initial load
            await Promise.all([
                loadCounts(),
                loadStudents(1, itemsPerPage, isBlocked),
            ]);
        };
        initializeData();
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const currentStudents = students;

    const openImageModal = (student: Student) => {
        setSelectedImageUrl(student.student_image_url || "/avatar-1.webp");
        setSelectedImageTitle(
            `${student.student_surname} ${student.student_name} ${student.student_fathername}`.trim()
        );
        setIsImageOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Все Студенты
                        </h1>
                    </div>
                    <Link to="/users/create">
                        <Button className="bg-black text-white duration-300 hover:bg-black/70 rounded-xl">
                            <IoMdAdd className="w-3 h-3" /> Добавить
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-start w-full">
                            <SearchInput
                                placeholder="Поиск студентов..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>

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
                                <TabsTrigger
                                    value="not_uploaded"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none px-4 py-2 font-medium text-gray-500 hover:text-gray-700"
                                >
                                    Не загружено{" "}
                                    <span className="ml-2 px-2 py-0.5 rounded-sm bg-orange-100 text-orange-700 text-xs font-semibold">
                                        {counts.not_uploaded}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table className="table-auto w-full">
                        <TableHeader className="bg-mainbg/10">
                            <TableRow>
                                {/* <TableHead className="text-maintx">
                                    <Checkbox
                                        checked={
                                            selectedUsers?.length ===
                                                currentStudents?.length &&
                                            currentStudents?.length > 0
                                        }
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead> */}
                                <TableHead className="text-maintx break-words whitespace-normal min-w-0 max-w-xs">
                                    #
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
                                <TableHead className="text-right text-maintx">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center py-8"
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span className="text-gray-500">
                                                Загрузка...
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : isSearching ? (
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
                                currentStudents?.map((student, idx) => (
                                    <TableRow
                                        key={student.student_id}
                                        className="border-dashed border-gray-200 hover:bg-gray-100"
                                    >
                                        {/* <TableCell className="w-12">
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
                                        </TableCell> */}
                                        <TableCell className="text-gray-600 break-words whitespace-normal min-w-0 max-w-xs">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="text-gray-600 break-words whitespace-normal min-w-0 max-w-xs">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-maintx flex-shrink-0 cursor-pointer"
                                                    onClick={() =>
                                                        openImageModal(student)
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            student?.student_image_url
                                                                ? student?.student_image_url
                                                                : "/avatar-1.webp"
                                                        }
                                                        alt={""}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        to={`/details/${student.student_id}`}
                                                        className="text-sm font-medium text-gray-900 hover:underline cursor-pointer transition-all duration-200 break-words"
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
                <CardFooter className="flex justify-between items-center border-t border-gray-200 pt-4">
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
                                <SelectItem value="50">50</SelectItem>
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
                    <p className="text-sm text-gray-600">
                        Вы уверены, что хотите удалить студента{" "}
                        <span className="font-semibold text-gray-900">
                            {userToDelete?.name}
                        </span>
                        ? Это действие нельзя отменить.
                    </p>
                </div>
            </CustomModal>

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
                    <p className="text-sm text-gray-600">
                        Вы хотите загрузить этого студента в терминал{" "}
                        <span className="font-semibold text-gray-900">
                            {studentToUpload?.name}
                        </span>
                        ?
                    </p>
                </div>
            </CustomModal>

            <CustomModal
                showTrigger={false}
                open={isImageOpen}
                onOpenChange={setIsImageOpen}
                title={selectedImageTitle || "Фото студента"}
                showFooter={false}
                size="sm"
            >
                <div className="flex items-center justify-center py-4">
                    <div className="w-60 h-60 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                            src={selectedImageUrl || "/avatar-1.webp"}
                            alt={selectedImageTitle}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};

export default Students;
