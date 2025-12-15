import React, { useEffect, useRef, useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
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
import { Button } from "@/components/ui/button";
import CustomPagination from "@/components/ui/custom-pagination";
import SearchInput from "@/components/ui/search-input";
import {
    Contract,
    deleteContract,
    fetchContracts,
    searchContracts,
    terminateContract,
} from "./data";
import { Link } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import CustomModal from "@/components/ui/custom-modal";
import { CiTrash } from "react-icons/ci";
import { MdOutlineCancel, MdCheckCircleOutline } from "react-icons/md";
import { GrEdit } from "react-icons/gr";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiDotsVertical, HiOutlineEye } from "react-icons/hi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ContractsPage: React.FC = () => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const searchTimeoutRef = useRef<number | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | "active" | "terminated">(
        "all"
    );
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isTerminateOpen, setIsTerminateOpen] = useState(false);
    const [contractToDelete, setContractToDelete] = useState<Contract | null>(
        null
    );
    const [contractToTerminate, setContractToTerminate] =
        useState<Contract | null>(null);
    const [terminationReason, setTerminationReason] = useState<string>(
        "Студент отчислен из ВУЗа"
    );
    const [counts, setCounts] = useState<{
        all: number;
        active: number;
        terminated: number;
    }>({
        all: 0,
        active: 0,
        terminated: 0,
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
    };

    const loadContracts = async (
        page: number,
        limit: number,
        isTerminated?: number
    ) => {
        try {
            setLoading(true);
            const { contracts, totalPages, totalCount } = await fetchContracts(
                page,
                limit,
                isTerminated
            );
            setContracts(contracts);
            setTotalPages(totalPages || 1);
            setCounts((prev) => ({
                all:
                    typeof isTerminated === "undefined" ? totalCount : prev.all,
                active: isTerminated === 0 ? totalCount : prev.active,
                terminated: isTerminated === 1 ? totalCount : prev.terminated,
            }));
        } catch (error) {
            // error already handled in fetchContracts
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const isTerminated =
            activeTab === "active"
                ? 0
                : activeTab === "terminated"
                ? 1
                : undefined;
        loadContracts(currentPage, itemsPerPage, isTerminated);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage, activeTab]);

    const handlePageChange = (page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (value: string) => {
        const newLimit = Number(value);
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = window.setTimeout(async () => {
            if (value.length < 2) {
                setIsSearching(false);
                const isTerminated =
                    activeTab === "active"
                        ? 0
                        : activeTab === "terminated"
                        ? 1
                        : undefined;
                loadContracts(1, itemsPerPage, isTerminated);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchContracts(value);
                setContracts(results);
                setTotalPages(1);
                setCurrentPage(1);
            } finally {
                setIsSearching(false);
            }
        }, 200);
    };

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleTabChange = (value: string) => {
        const tabValue = value as "all" | "active" | "terminated";
        setActiveTab(tabValue);
        setCurrentPage(1);
        const isTerminated =
            tabValue === "active"
                ? 0
                : tabValue === "terminated"
                ? 1
                : undefined;
        loadContracts(1, itemsPerPage, isTerminated);
    };

    const openDeleteModal = (contract: Contract) => {
        setContractToDelete(contract);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!contractToDelete) return;
        try {
            await deleteContract(contractToDelete.contract_id);
            const isTerminated =
                activeTab === "active"
                    ? 0
                    : activeTab === "terminated"
                    ? 1
                    : undefined;
            await loadContracts(currentPage, itemsPerPage, isTerminated);
            setIsDeleteOpen(false);
            setContractToDelete(null);
        } catch (error) {
            // error already handled
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteOpen(false);
        setContractToDelete(null);
    };

    const openTerminateModal = (contract: Contract) => {
        setContractToTerminate(contract);
        setIsTerminateOpen(true);
    };

    const handleConfirmTerminate = async () => {
        if (!contractToTerminate) return;
        try {
            await terminateContract(
                contractToTerminate.contract_id,
                terminationReason || "Студент отчислен из ВУЗа"
            );
            const isTerminated =
                activeTab === "active"
                    ? 0
                    : activeTab === "terminated"
                    ? 1
                    : undefined;
            await loadContracts(currentPage, itemsPerPage, isTerminated);
            setIsTerminateOpen(false);
            setContractToTerminate(null);
            setTerminationReason("Студент отчислен из ВУЗа");
        } catch (error) {
            // error already handled
        }
    };

    const handleCancelTerminate = () => {
        setIsTerminateOpen(false);
        setContractToTerminate(null);
        setTerminationReason("Студент отчислен из ВУЗа");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Все контракты
                </h1>
                <Link to="/floor-plan">
                    <Button className="bg-black text-white duration-300 hover:bg-black/70 rounded-xl">
                        <IoMdAdd className="w-3 h-3" /> Создать контракт
                    </Button>
                </Link>
            </div>

            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-start w-full">
                            <SearchInput
                                placeholder="Поиск по номеру контракта или студенту..."
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
                                    <span className="flex items-center gap-2">
                                        <HiOutlineEye className="w-4 h-4" />
                                        <span>Все</span>
                                        <span className="ml-2 px-2 py-0.5 rounded-sm bg-gray-200 text-gray-700 text-xs font-semibold">
                                            {counts.all}
                                        </span>
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="active"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-4 py-2 font-medium text-gray-500 hover:text-gray-700"
                                >
                                    <span className="flex items-center gap-2">
                                        <MdCheckCircleOutline className="w-4 h-4" />
                                        <span>Активные</span>
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="terminated"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-4 py-2 font-medium text-gray-500 hover:text-gray-700"
                                >
                                    <span className="flex items-center gap-2">
                                        <MdOutlineCancel className="w-4 h-4" />
                                        <span>Расторгнутые</span>
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
                                <TableHead className="text-maintx text-center">
                                    #
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Номер контракта
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Студент
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Этаж / Комната / Койка
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Период
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Ежемес. оплата
                                </TableHead>
                                <TableHead className="text-right text-maintx">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading || isSearching ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8"
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span className="text-gray-500">
                                                {loading
                                                    ? "Загрузка..."
                                                    : "Поиск..."}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : contracts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {searchQuery
                                            ? "Контракты не найдены"
                                            : "Нет контрактов"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contracts.map((contract, idx) => (
                                    <TableRow
                                        key={contract.contract_id}
                                        className="border-dashed border-gray-200 hover:bg-gray-50"
                                    >
                                        <TableCell className="text-center text-gray-700">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700 font-medium">
                                            {contract.contract_number}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700">
                                            {contract.student_full_name}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700">
                                            Этаж {contract.floor_number},
                                            комната {contract.room_number},
                                            койка {contract.bed_number}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700 text-sm">
                                            {formatDate(
                                                contract.contract_start_date
                                            )}{" "}
                                            –{" "}
                                            {formatDate(
                                                contract.contract_end_date
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700">
                                            {contract.contract_monthly_payment.toLocaleString()}{" "}
                                            сум
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
                                                        to={`/contracts/${contract.contract_id}`}
                                                    >
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                            <HiOutlineEye className="w-4 h-4" />
                                                            <span>
                                                                Просмотр
                                                            </span>
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    {contract.is_terminated ===
                                                    1 ? (
                                                        <DropdownMenuItem
                                                            disabled
                                                            className="flex items-center gap-2 text-orange-400 cursor-not-allowed"
                                                        >
                                                            <MdOutlineCancel className="w-4 h-4" />
                                                            <span>
                                                                Расторгнутый
                                                            </span>
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <>
                                                            <Link
                                                                to={`/contracts/${contract.contract_id}/edit`}
                                                            >
                                                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                                    <GrEdit className="w-4 h-4" />
                                                                    <span>
                                                                        Изменить
                                                                    </span>
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            <DropdownMenuItem
                                                                className="flex items-center gap-2 cursor-pointer text-orange-400 focus:text-orange-400"
                                                                onClick={() =>
                                                                    openTerminateModal(
                                                                        contract
                                                                    )
                                                                }
                                                            >
                                                                <MdOutlineCancel className="w-4 h-4" />
                                                                <span>
                                                                    Расторгнуть
                                                                </span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                contract
                                                            )
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
                        <label className="text-gray-500 text-sm">
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

            <CustomModal
                showTrigger={false}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Подтверждение удаления"
                confirmText="Удалить"
                cancelText="Отмена"
                confirmBg="bg-red-500"
                confirmBgHover="bg-red-500/70"
                confirmVariant="destructive"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                size="md"
                showCloseButton={false}
            >
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        Вы уверены, что хотите удалить контракт{" "}
                        <span className="font-semibold text-gray-900">
                            {contractToDelete?.contract_number}
                        </span>
                        ? Это действие нельзя отменить.
                    </p>
                </div>
            </CustomModal>

            <CustomModal
                showTrigger={false}
                open={isTerminateOpen}
                onOpenChange={setIsTerminateOpen}
                title="Расторгнуть контракт"
                confirmText="Расторгнуть"
                cancelText="Отмена"
                confirmBg="bg-orange-500"
                confirmBgHover="bg-orange-500/70"
                onConfirm={handleConfirmTerminate}
                onCancel={handleCancelTerminate}
                size="md"
                showCloseButton={false}
            >
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        Вы уверены, что хотите расторгнуть контракт{" "}
                        <span className="font-semibold text-gray-900">
                            {contractToTerminate?.contract_number}
                        </span>
                        ?
                    </p>
                    <div className="space-y-1 pt-2">
                        <p className="text-xs text-gray-500">
                            Причина расторжения:
                        </p>
                        <textarea
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                            rows={3}
                            value={terminationReason}
                            onChange={(e) =>
                                setTerminationReason(e.target.value)
                            }
                            placeholder="Укажите причину расторжения"
                        />
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};

export default ContractsPage;
