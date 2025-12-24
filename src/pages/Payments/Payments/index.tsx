import React, { useEffect, useRef, useState, useCallback } from "react";
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
    Payment,
    deletePayment,
    fetchPayments,
    searchPayments,
    createPayment,
    CreatePaymentData,
    fetchContractInfo,
    ContractInfo,
} from "./data";
import {
    searchContracts,
    fetchContracts,
    Contract,
} from "@/pages/Contracts/Contracts/data";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { IoMdAdd } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { formatNumber, parseNumber } from "@/utils/formatters";
import CustomModal from "@/components/ui/custom-modal";
import { CiTrash } from "react-icons/ci";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiDotsVertical, HiOutlineEye } from "react-icons/hi";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const PaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const searchTimeoutRef = useRef<number | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(
        null
    );
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contractsLoading, setContractsLoading] = useState(false);
    const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
    const [contractInfoLoading, setContractInfoLoading] = useState(false);
    const [form, setForm] = useState<CreatePaymentData>({
        contract_id: 0,
        payment_date: "",
        amount: 0,
        payment_method: 1,
        comments: "",
    });

    const loadPayments = async (page: number, limit: number) => {
        try {
            setLoading(true);
            const { payments, totalPages } = await fetchPayments(page, limit);
            setPayments(payments);
            setTotalPages(totalPages || 1);
        } catch (error) {
            // error already handled in fetchPayments
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments(currentPage, itemsPerPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage]);

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
                loadPayments(1, itemsPerPage);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchPayments(value);
                setPayments(results);
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

    const openDeleteModal = (payment: Payment) => {
        setPaymentToDelete(payment);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!paymentToDelete) return;
        try {
            await deletePayment(paymentToDelete.payment_id);
            await loadPayments(currentPage, itemsPerPage);
            setIsDeleteOpen(false);
            setPaymentToDelete(null);
        } catch (error) {
            // error already handled
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteOpen(false);
        setPaymentToDelete(null);
    };

    const handleContractSearch = useCallback(async (searchTerm: string) => {
        try {
            setContractsLoading(true);
            if (searchTerm && searchTerm.length >= 3) {
                // 3 yoki undan ko'p belgi bo'lsa search qilamiz
                const results = await searchContracts(searchTerm);
                setContracts(results);
            } else {
                // Bo'sh yoki 3 dan kam belgi bo'lsa barcha contractlarni yuklaymiz
                const { contracts } = await fetchContracts(1, 100, 0);
                setContracts(contracts);
            }
        } finally {
            setContractsLoading(false);
        }
    }, []);

    const handleContractComboboxOpen = async () => {
        try {
            setContractsLoading(true);
            const { contracts } = await fetchContracts(1, 100, 0);
            setContracts(contracts);
        } finally {
            setContractsLoading(false);
        }
    };

    const loadContractInfo = async (contractId: number) => {
        if (!contractId) {
            setContractInfo(null);
            return;
        }
        try {
            setContractInfoLoading(true);
            const info = await fetchContractInfo(contractId);
            setContractInfo(info);
        } catch (error) {
            // error already handled in fetchContractInfo
            setContractInfo(null);
        } finally {
            setContractInfoLoading(false);
        }
    };

    const handleAddPayment = async () => {
        if (
            !form.contract_id ||
            !form.payment_date ||
            !form.amount ||
            !form.payment_method
        ) {
            return;
        }
        try {
            setSubmitting(true);
            await createPayment(form);
            setIsAddModalOpen(false);
            setForm({
                contract_id: 0,
                payment_date: "",
                amount: 0,
                payment_method: 1,
                comments: "",
            });
            await loadPayments(currentPage, itemsPerPage);
        } catch (error) {
            // error already handled
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelAdd = () => {
        setIsAddModalOpen(false);
        setForm({
            contract_id: 0,
            payment_date: "",
            amount: 0,
            payment_method: 1,
            comments: "",
        });
        setContractInfo(null);
    };

    // Get max date (3 days ago) as Date object
    const getMaxDate = (): Date => {
        const date = new Date();
        date.setDate(date.getDate() - 3);
        date.setHours(0, 0, 0, 0);
        return date;
    };

    // Get today's date as Date object
    const getTodayDate = (): Date => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    };

    // Convert string date to Date object
    const getPaymentDateAsDate = (): Date | undefined => {
        if (!form.payment_date) return undefined;
        const date = new Date(form.payment_date);
        return isNaN(date.getTime()) ? undefined : date;
    };

    const contractOptions = contracts.map((contract) => ({
        value: contract.contract_id.toString(),
        label: `${contract.contract_number} - ${contract.student_full_name}`,
    }));

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Все платежи
                </h1>
                <Button
                    className="bg-black text-white duration-300 hover:bg-black/70 rounded-xl"
                    onClick={() => {
                        setIsAddModalOpen(true);
                        handleContractComboboxOpen();
                    }}
                >
                    <IoMdAdd className="w-3 h-3" /> Создать платеж
                </Button>
            </div>

            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-start w-full">
                            <SearchInput
                                placeholder="Поиск по номеру контракта, студенту или телефону..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
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
                                    Дата платежа
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Сумма
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Способ оплаты
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Статус возврата
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Этаж / Комната / Койка
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
                                        colSpan={9}
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
                            ) : payments.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {searchQuery
                                            ? "Платежи не найдены"
                                            : "Нет платежей"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment, idx) => (
                                    <TableRow
                                        key={payment.payment_id}
                                        className="border-dashed border-gray-200 hover:bg-gray-50"
                                    >
                                        <TableCell className="text-center text-gray-700">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700 font-medium">
                                            {payment.contract_number}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700">
                                            <div className="flex items-center justify-start gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0">
                                                    <img
                                                        src={
                                                            payment.student_image_url ||
                                                            "/avatar-1.webp"
                                                        }
                                                        alt={
                                                            payment.student_full_name
                                                        }
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="text-sm">
                                                    {payment.student_full_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700">
                                            {formatDate(payment.payment_date)}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700 font-semibold">
                                            {payment.amount.toLocaleString()}{" "}
                                            сум
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700">
                                            {payment.payment_method_text}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                className={cn(
                                                    "px-2 py-1 text-xs font-semibold",
                                                    payment.is_refund === 1
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "bg-green-100 text-green-700"
                                                )}
                                            >
                                                {payment.is_refund_text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-gray-700">
                                            Этаж {payment.floor_number}, комната{" "}
                                            {payment.room_number}, койка{" "}
                                            {payment.bed_number}
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
                                                        to={`/contracts/${payment.contract_id}`}
                                                    >
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                            <HiOutlineEye className="w-4 h-4" />
                                                            <span>
                                                                Просмотр
                                                                контракта
                                                            </span>
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                payment
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
                        Вы уверены, что хотите удалить платеж от{" "}
                        <span className="font-semibold text-gray-900">
                            {paymentToDelete?.student_full_name}
                        </span>{" "}
                        на сумму{" "}
                        <span className="font-semibold text-gray-900">
                            {paymentToDelete?.amount.toLocaleString()} сум
                        </span>
                        ? Это действие нельзя отменить.
                    </p>
                </div>
            </CustomModal>

            <CustomModal
                showTrigger={false}
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                title="Создать платеж"
                confirmText="Создать"
                cancelText="Отмена"
                confirmBg="bg-black"
                confirmBgHover="bg-black/70"
                onConfirm={handleAddPayment}
                onCancel={handleCancelAdd}
                size="lg"
                showCloseButton={false}
                confirmDisabled={
                    submitting ||
                    !form.contract_id ||
                    !form.payment_date ||
                    !form.amount ||
                    !form.payment_method
                }
            >
                <div className="space-y-4">
                    <SearchableCombobox
                        label="Контракт"
                        placeholder="Выберите контракт..."
                        value={form.contract_id.toString()}
                        onChange={(value) => {
                            const contractId = Number(value) || 0;
                            setForm((prev) => ({
                                ...prev,
                                contract_id: contractId,
                            }));
                            loadContractInfo(contractId);
                        }}
                        onSearch={handleContractSearch}
                        onOpen={handleContractComboboxOpen}
                        options={contractOptions}
                        isLoading={contractsLoading}
                        required
                    />

                    {contractInfo && (
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    Номер контракта:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {contractInfo.contract_number}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    Общая сумма:
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {formatNumber(
                                        contractInfo.contract_total_price.toString()
                                    )}{" "}
                                    сум
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    Оплачено:
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                    {formatNumber(
                                        contractInfo.total_paid.toString()
                                    )}{" "}
                                    сум
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    Остаток:
                                </span>
                                <span className="text-sm font-semibold text-orange-600">
                                    {formatNumber(
                                        contractInfo.remaining_amount.toString()
                                    )}{" "}
                                    сум
                                </span>
                            </div>
                        </div>
                    )}

                    {contractInfoLoading && (
                        <div className="flex items-center justify-center py-4">
                            <div className="w-6 h-6 border-2 border-mainbg border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="payment_date">
                            Дата платежа <span className="text-red-500">*</span>
                        </Label>
                        <DatePicker
                            date={getPaymentDateAsDate()}
                            onSelect={(date) => {
                                if (date) {
                                    // Local vaqt formatida string yaratish (timezone muammosini oldini olish)
                                    const year = date.getFullYear();
                                    const month = String(
                                        date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(
                                        2,
                                        "0"
                                    );
                                    const dateString = `${year}-${month}-${day}`;
                                    setForm((prev) => ({
                                        ...prev,
                                        payment_date: dateString,
                                    }));
                                } else {
                                    setForm((prev) => ({
                                        ...prev,
                                        payment_date: "",
                                    }));
                                }
                            }}
                            placeholder="Выберите дату платежа"
                            className="w-full h-12"
                            minDate={getMaxDate()}
                            maxDate={getTodayDate()}
                        />
                        <p className="text-xs text-gray-500">
                            Можно выбрать дату до 3 дней назад
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            Сумма <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="amount"
                            type="text"
                            value={
                                form.amount
                                    ? formatNumber(form.amount.toString())
                                    : ""
                            }
                            onChange={(e) => {
                                const cleanedValue = parseNumber(
                                    e.target.value
                                );
                                const numericValue = cleanedValue
                                    ? Number(cleanedValue)
                                    : 0;
                                setForm((prev) => ({
                                    ...prev,
                                    amount: numericValue,
                                }));
                            }}
                            className="rounded-xl h-12"
                            placeholder="Введите сумму"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment_method">
                            Способ оплаты{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={form.payment_method.toString()}
                            onValueChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,
                                    payment_method: Number(value),
                                }))
                            }
                        >
                            <SelectTrigger className="rounded-xl h-12">
                                <SelectValue placeholder="Выберите способ оплаты" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Наличные</SelectItem>
                                <SelectItem value="2">
                                    Перевод на карту
                                </SelectItem>
                                <SelectItem value="3">Перечисление</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comments">Комментарии</Label>
                        <textarea
                            id="comments"
                            value={form.comments || ""}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                            ) =>
                                setForm((prev) => ({
                                    ...prev,
                                    comments: e.target.value,
                                }))
                            }
                            className="w-full rounded-xl min-h-[100px] px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-mainbg focus:border-mainbg"
                            placeholder="Введите комментарии (необязательно)"
                        />
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};

export default PaymentsPage;
