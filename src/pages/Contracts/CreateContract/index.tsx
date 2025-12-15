import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { CustomCombobox, CustomDatePicker } from "@/components/ui/custom-form";
import {
    CreateContractFormData,
    fetchContractPlan,
    isContractFormValid,
    createContract,
    ContractPlanResponse,
} from "./data";
import { RiArrowGoBackLine } from "react-icons/ri";
import {
    Student,
    fetchStudents,
    searchStudents,
} from "@/pages/Students/Students/data";

const CreateContractPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const initialBedId = searchParams.get("bed_id") || "";
    const initialRoomNumber = searchParams.get("room_number") || "";
    const initialFloorNumber = searchParams.get("floor_number") || "";

    const [form, setForm] = useState<CreateContractFormData>({
        student_id: "",
        contract_start_date: "",
        number_of_months: "",
        contract_monthly_payment: null,
        bed_id: initialBedId,
        contract_number: "",
    });

    const [monthlyPaymentInput, setMonthlyPaymentInput] = useState<string>("");
    const [plan, setPlan] = useState<ContractPlanResponse | null>(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);

    const handleChange = (
        field: keyof CreateContractFormData,
        value: string
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCalculatePlan = async () => {
        if (
            !form.contract_start_date ||
            !form.number_of_months ||
            !monthlyPaymentInput
        ) {
            return;
        }
        const months = Number(form.number_of_months);
        const monthly = Number(monthlyPaymentInput);
        if (!months || !monthly) return;

        setLoadingPlan(true);
        const data = await fetchContractPlan(
            form.contract_start_date,
            months,
            monthly
        );
        setLoadingPlan(false);
        if (!data) return;

        setPlan(data);
        // Берём ежемесячную оплату из summary
        if (data.summary?.monthly_payment) {
            setForm((prev) => ({
                ...prev,
                contract_monthly_payment: data.summary.monthly_payment,
            }));
        }
    };

    const handleStudentSearchChange = async (value: string) => {
        if (value.length < 3) {
            return;
        }
        try {
            setStudentsLoading(true);
            const results = await searchStudents(value, "all");
            setStudents(results);
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isContractFormValid(form)) return;
        try {
            setSubmitting(true);
            await createContract(form);
            navigate("/contracts");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const loadStudents = async () => {
            try {
                setStudentsLoading(true);
                const { students } = await fetchStudents(1, 100);
                setStudents(students);
            } catch (error) {
                // error already handled in fetchStudents
            } finally {
                setStudentsLoading(false);
            }
        };
        loadStudents();
    }, []);

    const handleStartDateChange = (date: Date | undefined) => {
        setStartDate(date);
        handleChange(
            "contract_start_date",
            date ? date.toISOString().slice(0, 10) : ""
        );
    };

    const studentOptions = students.map((s) => ({
        value: s.student_id.toString(),
        label: `${s.student_surname} ${s.student_name} (${s.passport_series})`,
    }));

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
                    Создать контракт
                </h1>
            </div>

            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                        Основная информация
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {initialBedId && (
                        <div className="flex justify-between gap-4 text-sm bg-blue-50 rounded-xl p-4">
                            <div className="flex gap-2">
                                <div className="text-gray-500">Этаж :</div>
                                <div className="font-semibold col-span-2">
                                    {initialFloorNumber || "—"}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="text-gray-500">Комната :</div>
                                <div className="font-semibold col-span-2">
                                    {initialRoomNumber || "—"}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="text-gray-500">Койка :</div>
                                <div className="font-semibold col-span-2">
                                    {initialBedId}
                                </div>
                            </div>
                        </div>
                    )}

                    <form
                        className="space-y-4"
                        onSubmit={handleSubmit}
                        id="create-contract-form"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Студент</Label>
                                <CustomCombobox
                                    label=""
                                    placeholder={
                                        studentsLoading
                                            ? "Загрузка..."
                                            : "Выберите студента"
                                    }
                                    value={form.student_id}
                                    onChange={(value) =>
                                        handleChange("student_id", value)
                                    }
                                    options={studentOptions}
                                    onSearchChange={handleStudentSearchChange}
                                    required
                                />
                            </div>
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
                                    placeholder="Например: 11"
                                    className="h-12 rounded-xl border-gray-200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <CustomDatePicker
                                    label="Дата начала"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    required
                                />
                            </div>
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
                                    placeholder="Например: 6"
                                    className="h-12 rounded-xl border-gray-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="monthly_payment_input"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Ежемесячная оплата (сум)
                                </Label>
                                <Input
                                    id="monthly_payment_input"
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                        monthlyPaymentInput
                                            ? Number(
                                                  monthlyPaymentInput
                                              ).toLocaleString("ru-RU")
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const numeric = e.target.value
                                            .replace(/\s/g, "")
                                            .replace(/,/g, "")
                                            .replace(/\D/g, "");
                                        setMonthlyPaymentInput(numeric);
                                    }}
                                    placeholder="Например: 500000"
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
                                    !form.student_id ||
                                    !form.contract_start_date ||
                                    !form.number_of_months ||
                                    !monthlyPaymentInput
                                }
                            >
                                {loadingPlan ? "Расчёт..." : "Рассчитать план"}
                            </Button>
                            <div className="text-xs text-gray-600">
                                После расчёта план задаст значение ежемесячной
                                оплаты.
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Ежемесячная оплата (из плана)</Label>
                            <div className="h-10 px-3 flex items-center rounded-md border bg-gray-50 text-sm text-gray-900">
                                {form.contract_monthly_payment
                                    ? `${form.contract_monthly_payment.toLocaleString()} сум`
                                    : "Не рассчитано"}
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
                </CardContent>
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
                        form="create-contract-form"
                        disabled={submitting || !isContractFormValid(form)}
                        className="bg-black text-white hover:bg-black/80 rounded-xl"
                    >
                        {submitting ? "Создание..." : "Создать контракт"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default CreateContractPage;
