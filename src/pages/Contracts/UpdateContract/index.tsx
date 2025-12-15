import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomDatePicker } from "@/components/ui/custom-form";
import {
    UpdateContractFormData,
    fetchContractForUpdate,
    updateContract,
} from "./data";
import {
    ContractPlanResponse,
    fetchContractPlan,
} from "@/pages/Contracts/CreateContract/data";
import { RiArrowGoBackLine } from "react-icons/ri";

const UpdateContractPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();

    const [form, setForm] = useState<UpdateContractFormData | null>(null);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [plan, setPlan] = useState<ContractPlanResponse | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
    const [bedInfo, setBedInfo] = useState<{
        floor_number?: string;
        room_number?: string;
        bed_number?: string;
    } | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            const data = await fetchContractForUpdate(Number(id));
            if (data) {
                setForm(data);
                if (data.contract_start_date) {
                    setStartDate(new Date(data.contract_start_date));
                }
                setBedInfo({
                    floor_number: data.floor_number
                        ? String(data.floor_number)
                        : undefined,
                    room_number: data.room_number
                        ? String(data.room_number)
                        : undefined,
                    bed_number: data.bed_number
                        ? String(data.bed_number)
                        : undefined,
                });
            }
            setLoading(false);
        };
        load();
    }, [id]);

    useEffect(() => {
        if (!form) return;
        const bedId = searchParams.get("bed_id");
        const roomNumber = searchParams.get("room_number");
        const floorNumber = searchParams.get("floor_number");
        if (bedId) {
            setForm((prev) => (prev ? { ...prev, bed_id: bedId } : prev));
            setBedInfo({
                floor_number: floorNumber || undefined,
                room_number: roomNumber || undefined,
                bed_number: bedId,
            });
        }
    }, [searchParams, form]);

    const handleChange = (
        field: keyof UpdateContractFormData,
        value: string
    ) => {
        if (!form) return;
        setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleStartDateChange = (date: Date | undefined) => {
        setStartDate(date);
        if (!form) return;
        setForm((prev) =>
            prev
                ? {
                      ...prev,
                      contract_start_date: date
                          ? date.toISOString().slice(0, 10)
                          : "",
                  }
                : prev
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        try {
            setSubmitting(true);
            await updateContract(form);
            navigate("/contracts");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCalculatePlan = async () => {
        if (
            !form ||
            !form.contract_start_date ||
            !form.number_of_months ||
            !form.contract_monthly_payment
        ) {
            return;
        }
        const months = Number(form.number_of_months);
        if (!months) return;

        setLoadingPlan(true);
        const data = await fetchContractPlan(
            form.contract_start_date,
            months,
            form.contract_monthly_payment
        );
        setLoadingPlan(false);
        if (!data) return;

        setPlan(data);
        if (data.summary?.monthly_payment) {
            setForm((prev) =>
                prev
                    ? {
                          ...prev,
                          contract_monthly_payment:
                              data.summary.monthly_payment,
                      }
                    : prev
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 ">
                <Button
                    className="rounded-xl"
                    size={"sm"}
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    <RiArrowGoBackLine className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Обновить контракт
                </h1>
            </div>

            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                        Основная информация
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading || !form ? (
                        <div className="flex items-center justify-center py-10 space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-gray-500 text-sm">
                                Загрузка...
                            </span>
                        </div>
                    ) : (
                        <form
                            className="space-y-4"
                            onSubmit={handleSubmit}
                            id="update-contract-form"
                        >
                            {bedInfo && (
                                <div className="flex justify-between gap-4 text-sm bg-blue-50 rounded-xl p-4">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="text-gray-500">
                                            Этаж :
                                        </div>
                                        <div className="font-semibold col-span-2">
                                            {bedInfo.floor_number || "—"}
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="text-gray-500">
                                            Комната :
                                        </div>
                                        <div className="font-semibold col-span-2">
                                            {bedInfo.room_number || "—"}
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="text-gray-500">
                                            Койка :
                                        </div>
                                        <div className="font-semibold col-span-2">
                                            {bedInfo.bed_number || "—"}
                                        </div>
                                    </div>
                                    {id && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/floor-plan?mode=updateContract&contractId=${id}`
                                                )
                                            }
                                        >
                                            Выбрать на плане
                                        </Button>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="contract_number"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Номер контракта
                                    </Label>
                                    <Input
                                        id="contract_number"
                                        value={form.contract_number}
                                        onChange={(e) =>
                                            handleChange(
                                                "contract_number",
                                                e.target.value
                                            )
                                        }
                                        className="h-12 rounded-xl border-gray-200"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <CustomDatePicker
                                        label="Дата начала"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="number_of_months"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Кол-во месяцев
                                    </Label>
                                    <Input
                                        id="number_of_months"
                                        type="number"
                                        min={1}
                                        value={form.number_of_months}
                                        onChange={(e) =>
                                            handleChange(
                                                "number_of_months",
                                                e.target.value
                                            )
                                        }
                                        className="h-12 rounded-xl border-gray-200"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="monthly_payment"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Ежемесячная оплата (сум)
                                    </Label>
                                    <Input
                                        id="monthly_payment"
                                        type="number"
                                        min={0}
                                        value={
                                            form.contract_monthly_payment ?? ""
                                        }
                                        onChange={(e) =>
                                            setForm((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          contract_monthly_payment:
                                                              e.target.value
                                                                  ? Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                  : null,
                                                      }
                                                    : prev
                                            )
                                        }
                                        className="h-12 rounded-xl border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCalculatePlan}
                                    disabled={
                                        loadingPlan ||
                                        !form.contract_start_date ||
                                        !form.number_of_months ||
                                        !form.contract_monthly_payment
                                    }
                                >
                                    {loadingPlan
                                        ? "Расчёт..."
                                        : "Рассчитать план"}
                                </Button>
                                <div className="text-xs text-gray-600">
                                    План обновит ежемесячную оплату по
                                    рассчитанному значению.
                                </div>
                            </div>

                            {plan && (
                                <div className="mt-2 border rounded-xl p-3 max-h-56 overflow-auto space-y-2 bg-gray-50">
                                    {plan.schedule.map((item) => (
                                        <div
                                            key={item.month_number}
                                            className="flex justify-between text-xs bg-white rounded-lg px-3 py-2"
                                        >
                                            <span className="text-gray-700">
                                                {item.payment_date_formatted} (
                                                {item.month_name} {item.year})
                                            </span>
                                            <span className="text-gray-900 font-semibold">
                                                {item.monthly_fee.toLocaleString()}{" "}
                                                сум
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </form>
                    )}
                </CardContent>
                {!loading && form && (
                    <CardFooter className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            form="update-contract-form"
                            disabled={submitting}
                            className="bg-black text-white hover:bg-black/80 rounded-xl"
                        >
                            {submitting ? "Обновление..." : "Обновить контракт"}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default UpdateContractPage;
