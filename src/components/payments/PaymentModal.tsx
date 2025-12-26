import React, { useState, useEffect, useCallback } from "react";
import CustomModal from "@/components/ui/custom-modal";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatNumber, parseNumber } from "@/utils/formatters";
import {
    createPayment,
    fetchContractInfo,
    CreatePaymentData,
    ContractInfo,
} from "@/pages/Payments/Payments/data";
import {
    searchContracts,
    fetchContracts,
    Contract,
} from "@/pages/Contracts/Contracts/data";

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialContractId?: number;
    contractDisabled?: boolean;
    onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    open,
    onOpenChange,
    initialContractId,
    contractDisabled = false,
    onSuccess,
}) => {
    const [submitting, setSubmitting] = useState(false);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contractsLoading, setContractsLoading] = useState(false);
    const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
    const [contractInfoLoading, setContractInfoLoading] = useState(false);
    const [form, setForm] = useState<CreatePaymentData>({
        contract_id: initialContractId || 0,
        payment_date: "",
        amount: 0,
        payment_method: 1,
        comments: "",
    });

    // Reset form when modal opens/closes or initialContractId changes
    useEffect(() => {
        if (open) {
            setForm({
                contract_id: initialContractId || 0,
                payment_date: "",
                amount: 0,
                payment_method: 1,
                comments: "",
            });
            if (initialContractId) {
                loadContractInfo(initialContractId);
            } else {
                setContractInfo(null);
            }
        } else {
            // Reset when modal closes
            setForm({
                contract_id: 0,
                payment_date: "",
                amount: 0,
                payment_method: 1,
                comments: "",
            });
            setContractInfo(null);
        }
    }, [open, initialContractId]);

    const handleContractSearch = useCallback(async (searchTerm: string) => {
        try {
            setContractsLoading(true);
            if (searchTerm.length >= 3) {
                const results = await searchContracts(searchTerm);
                setContracts(results);
            } else if (searchTerm.length === 0) {
                const { contracts } = await fetchContracts(1, 100);
                setContracts(contracts);
            }
        } catch (error) {
            // error already handled
        } finally {
            setContractsLoading(false);
        }
    }, []);

    const handleContractComboboxOpen = async () => {
        if (contracts.length === 0) {
            await handleContractSearch("");
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
            onOpenChange(false);
            setForm({
                contract_id: initialContractId || 0,
                payment_date: "",
                amount: 0,
                payment_method: 1,
                comments: "",
            });
            setContractInfo(null);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            // error already handled
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
        setForm({
            contract_id: initialContractId || 0,
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

    return (
        <CustomModal
            showTrigger={false}
            open={open}
            onOpenChange={onOpenChange}
            title="Создать платеж"
            confirmText="Создать"
            cancelText="Отмена"
            confirmBg="bg-black"
            confirmBgHover="bg-black/70"
            onConfirm={handleAddPayment}
            onCancel={handleCancel}
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
                <div>
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
                        disabled={contractDisabled}
                    />
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            placeholder="Выберите дату"
                            className="w-full h-12"
                            minDate={getMaxDate()}
                            maxDate={getTodayDate()}
                        />
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
                </div>

                <div className="space-y-2">
                    <Label htmlFor="payment_method">
                        Способ оплаты <span className="text-red-500">*</span>
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
                            <SelectItem value="2">Перевод на карту</SelectItem>
                            <SelectItem value="3">Перечисление</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="comments">Комментарии</Label>
                    <textarea
                        id="comments"
                        value={form.comments || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
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
    );
};

export default PaymentModal;
