import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RiArrowGoBackLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    ContractDetail,
    fetchContractById,
} from "@/pages/Contracts/ContractDetails/data";

const ContractDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contract, setContract] = useState<ContractDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            const data = await fetchContractById(Number(id));
            setContract(data);
            setLoading(false);
        };
        load();
    }, [id]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Button
                        className="rounded-xl"
                        size="sm"
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        <RiArrowGoBackLine className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Детали контракта
                    </h1>
                </div>
                {contract &&
                    id &&
                    (contract.is_terminated === 1 ? (
                        <Button
                            className="rounded-xl bg-gray-100 text-gray-600 cursor-default"
                            size="sm"
                            type="button"
                            disabled
                        >
                            Расторгнутый
                        </Button>
                    ) : (
                        <Button
                            className="rounded-xl bg-black text-white hover:bg-black/80"
                            size="sm"
                            type="button"
                            onClick={() => navigate(`/contracts/${id}/edit`)}
                        >
                            Изменить
                        </Button>
                    ))}
            </div>

            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                        Основная информация
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-10 space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-gray-500 text-sm">
                                Загрузка...
                            </span>
                        </div>
                    ) : !contract ? (
                        <div className="text-sm text-gray-500">
                            Контракт не найден
                        </div>
                    ) : (
                        <>
                            {/* Student info */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden border">
                                    <img
                                        src={
                                            contract.student_image_url ||
                                            "/avatar-1.webp"
                                        }
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {contract.student_full_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {contract.university_name} •{" "}
                                        {contract.university_group_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Паспорт: {contract.passport_series} •
                                        ПИНФЛ: {contract.student_pinfl}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                                    <div className="text-xs text-gray-500">
                                        Обучение
                                    </div>
                                    <div className="text-gray-900">
                                        Факультет: {contract.faculty}
                                    </div>
                                    <div className="text-gray-900">
                                        Направление: {contract.field_of_study}
                                    </div>
                                    <div className="text-gray-900">
                                        Курс: {contract.course_level}
                                    </div>
                                    <div className="text-gray-900">
                                        Срок обучения: {contract.study_period}{" "}
                                        год
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                                    <div className="text-xs text-gray-500">
                                        Контактные данные
                                    </div>
                                    <div className="text-gray-900">
                                        Телефон: {contract.phone_number}
                                    </div>
                                    {contract.additional_phone_number && (
                                        <div className="text-gray-900">
                                            Доп.:{" "}
                                            {contract.additional_phone_number}
                                        </div>
                                    )}
                                    {contract.owner_additional_phone_number && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {
                                                contract.owner_additional_phone_number
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                                    <div className="text-xs text-gray-500">
                                        Адрес
                                    </div>
                                    <div className="text-gray-900">
                                        {contract.region_name}
                                    </div>
                                    <div className="text-gray-900">
                                        {contract.district_name}
                                    </div>
                                    <div className="text-gray-900">
                                        {contract.address}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                                    <div className="text-xs text-gray-500">
                                        Койка
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        Этаж {contract.floor_number}, Комната{" "}
                                        {contract.room_number}, Койка{" "}
                                        {contract.bed_number}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Contract info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                                    <div className="text-xs text-gray-500">
                                        Контракт
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        № {contract.contract_number}
                                    </div>
                                    <div className="text-gray-700">
                                        {formatDate(
                                            contract.contract_start_date
                                        )}{" "}
                                        →{" "}
                                        {formatDate(contract.contract_end_date)}
                                    </div>
                                    <div className="text-gray-700">
                                        Месяцев: {contract.number_of_months}
                                    </div>
                                    <div className="text-gray-700">
                                        Статус:{" "}
                                        <Badge
                                            className={cn(
                                                "ml-1",
                                                contract.contract_status === 1
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-gray-100 text-gray-700"
                                            )}
                                        >
                                            {contract.contract_status_text}
                                        </Badge>
                                    </div>
                                    <div className="text-gray-700">
                                        Оплата:{" "}
                                        <Badge
                                            className={cn(
                                                "ml-1",
                                                contract.payment_status === 1
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            )}
                                        >
                                            {contract.payment_status_text}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                                    <div className="text-xs text-gray-500">
                                        Финансы
                                    </div>
                                    <div className="text-gray-900">
                                        Ежемесячно:{" "}
                                        <span className="font-semibold">
                                            {contract.contract_monthly_payment.toLocaleString()}{" "}
                                            сум
                                        </span>
                                    </div>
                                    <div className="text-gray-900">
                                        Итого:{" "}
                                        <span className="font-semibold">
                                            {contract.contract_total_price.toLocaleString()}{" "}
                                            сум
                                        </span>
                                    </div>
                                    <div className="text-gray-900">
                                        Осталось оплатить:{" "}
                                        <span className="font-semibold">
                                            {contract.plan.statistics.remaining_amount.toLocaleString()}{" "}
                                            сум
                                        </span>
                                    </div>
                                    <div className="text-gray-900">
                                        Оплачено месяцев:{" "}
                                        {contract.plan.statistics.paid_months}{" "}
                                        из{" "}
                                        {contract.plan.statistics.total_months}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Payments schedule */}
                            <div className="space-y-2 text-sm">
                                <div className="text-xs text-gray-500">
                                    График платежей
                                </div>
                                <div className="max-h-64 overflow-auto space-y-2 pr-1">
                                    {contract.plan.payments.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2"
                                        >
                                            <div className="text-gray-700 text-xs">
                                                {p.monthly_payment_date}
                                            </div>
                                            <div className="text-gray-900 font-semibold">
                                                {p.monthly_fee.toLocaleString()}{" "}
                                                сум
                                            </div>
                                            <div
                                                className={cn(
                                                    "px-2 py-0.5 rounded-full text-xs",
                                                    p.payment_status === 1
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                )}
                                            >
                                                {p.payment_status === 1
                                                    ? "Оплачен"
                                                    : "Не оплачен"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ContractDetailsPage;
