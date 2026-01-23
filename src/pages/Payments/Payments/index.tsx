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
    Payment,
    deletePayment,
    fetchPayments,
    searchPayments,
    ContractPaymentDetail,
    fetchContractPaymentDetail,
} from "./data";
import { IoMdAdd } from "react-icons/io";
import CustomModal from "@/components/ui/custom-modal";
import PaymentModal from "@/components/payments/PaymentModal";
import { CiTrash } from "react-icons/ci";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiDotsVertical, HiOutlineEye } from "react-icons/hi";
import { MdMessage } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

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
    const [isPaymentDetailOpen, setIsPaymentDetailOpen] = useState(false);
    const [contractDetail, setContractDetail] =
        useState<ContractPaymentDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const openPaymentDetail = async (contractId: number) => {
        setLoadingDetail(true);
        setIsPaymentDetailOpen(true);
        const detail = await fetchContractPaymentDetail(contractId);
        setContractDetail(detail);
        setLoadingDetail(false);
    };

    const closePaymentDetail = () => {
        setIsPaymentDetailOpen(false);
        setContractDetail(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Все платежи
                </h1>
                <Button
                    className="bg-black text-white duration-300 hover:bg-black/70 rounded-xl"
                    onClick={() => setIsAddModalOpen(true)}
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
                                    Комментарии
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
                                            {payment.comments ? (
                                                <div className="relative group inline-flex items-center justify-center">
                                                    <MdMessage className="w-5 h-5 text-green-600 cursor-pointer" />
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal max-w-xs z-50">
                                                        {payment.comments}
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                            <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap flex items-center justify-end gap-2">
                                        <Button variant="ghost"
                                                        className="flex items-center gap-2 cursor-pointer"
                                                        onClick={() =>
                                                            openPaymentDetail(
                                                                payment.contract_id
                                                            )
                                                        }
                                                    >
                                                        <HiOutlineEye className="w-4 h-4" />

                                                    </Button>
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

            <PaymentModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSuccess={() => loadPayments(currentPage, itemsPerPage)}
            />

            <CustomModal
                showTrigger={false}
                open={isPaymentDetailOpen}
                onOpenChange={setIsPaymentDetailOpen}
                title="Детали платежа"
                showFooter={false}
                size="lg"
                onCancel={closePaymentDetail}
            >
                <div className="space-y-4">
                    {loadingDetail ? (
                        <div className="flex items-center justify-center py-10 space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-gray-500 text-sm">
                                Загрузка...
                            </span>
                        </div>
                    ) : !contractDetail ? (
                        <div className="text-sm text-gray-500 text-center py-4">
                            Данные не найдены
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                <div className="text-xs text-gray-500">
                                    Финансы
                                </div>
                                <div className="text-gray-900">
                                    Ежемесячно:{" "}
                                    <span className="font-semibold">
                                        {contractDetail.contract_monthly_payment.toLocaleString()}{" "}
                                        сум
                                    </span>
                                </div>
                                <div className="text-gray-900">
                                    Итого:{" "}
                                    <span className="font-semibold">
                                        {contractDetail.contract_total_price.toLocaleString()}{" "}
                                        сум
                                    </span>
                                </div>
                                <div className="text-gray-900">
                                    Оплачено:{" "}
                                    <span className="font-semibold text-green-600">
                                        {contractDetail.plan.statistics.total_paid.toLocaleString()}{" "}
                                        сум
                                    </span>
                                </div>
                                <div className="text-gray-900">
                                    Осталось оплатить:{" "}
                                    <span className="font-semibold">
                                        {contractDetail.plan.statistics.remaining_amount.toLocaleString()}{" "}
                                        сум
                                    </span>
                                </div>
                                <div className="text-gray-900">
                                    Оплачено месяцев:{" "}
                                    {contractDetail.plan.statistics.paid_months}{" "}
                                    из{" "}
                                    {contractDetail.plan.statistics.total_months}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="text-xs text-gray-500">
                                    График платежей
                                </div>
                                <div className="max-h-64 overflow-auto space-y-2 pr-1">
                                    {contractDetail.plan.payments.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2"
                                        >
                                            <div className="text-gray-700 text-xs">
                                                {p.monthly_payment_date}
                                            </div>
                                            <div className="text-gray-900 font-semibold text-xs">
                                                {p.monthly_fee.toLocaleString()}
                                                /{" "}
                                                <span
                                                    className={
                                                        p.monthly_fee ===
                                                        p.payment_amount
                                                            ? "text-green-500"
                                                            : p.payment_amount > 0
                                                            ? "text-yellow-500"
                                                            : "text-red-600"
                                                    }
                                                >
                                                    {p.payment_amount > 0
                                                        ? p.payment_amount.toLocaleString()
                                                        : 0}
                                                </span>{" "}
                                                сум
                                            </div>
                                            <div
                                                className={cn(
                                                    "px-2 py-0.5 rounded-full text-xs",
                                                    p.payment_status === 1
                                                        ? "bg-green-100 text-green-700"
                                                        : p.payment_status === 2
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                )}
                                            >
                                                {p.payment_status === 1
                                                    ? "Оплачен"
                                                    : p.payment_status === 2
                                                    ? "Частично"
                                                    : "Не оплачен"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CustomModal>
        </div>
    );
};

export default PaymentsPage;
