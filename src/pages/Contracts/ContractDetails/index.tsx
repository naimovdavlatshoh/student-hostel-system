import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RiArrowGoBackLine } from "react-icons/ri";
import { FiDownload } from "react-icons/fi";
import { FiUpload } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CustomModal from "@/components/ui/custom-modal";
import {
    ContractDetail,
    fetchContractById,
    downloadContractWord,
    uploadSignedContract,
    downloadContractPDF,
} from "@/pages/Contracts/ContractDetails/data";
import { MdPayment } from "react-icons/md";
import PaymentModal from "@/components/payments/PaymentModal";

const ContractDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contract, setContract] = useState<ContractDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [downloading, setDownloading] = useState<boolean>(false);
    const [downloadingPDF, setDownloadingPDF] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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

    const handleDownloadWord = async () => {
        if (!id) return;
        setDownloading(true);
        try {
            const blob = await downloadContractWord(Number(id));
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `contract_${id}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading contract:", error);
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!id) return;
        setDownloadingPDF(true);
        try {
            const blob = await downloadContractPDF(Number(id));
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `contract_${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading PDF:", error);
        } finally {
            setDownloadingPDF(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Пожалуйста, выберите PDF файл");
            return;
        }

        setSelectedFile(file);
    };

    const handleUploadPDF = async () => {
        if (!id || !selectedFile) return;

        setUploading(true);
        try {
            await uploadSignedContract(Number(id), selectedFile);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            // Reload contract data
            const data = await fetchContractById(Number(id));
            setContract(data);
            setIsUploadModalOpen(false);
        } catch (error) {
            console.error("Error uploading PDF:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleCancelUpload = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setIsUploadModalOpen(false);
    };

    const openPaymentModal = () => {
        setIsPaymentModalOpen(true);
    };

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
                <div className="flex items-center gap-2">
                    {contract && id && (
                        <>
                            {contract.contract_status !== 2 && (
                                <Button
                                    className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                                    size="sm"
                                    type="button"
                                    onClick={handleDownloadWord}
                                    disabled={downloading}
                                >
                                    <FiDownload className="w-4 h-4 mr-2" />
                                    {downloading
                                        ? "Загрузка..."
                                        : "Скачать Word"}
                                </Button>
                            )}
                            {contract.contract_status === 2 ? (
                                <Button
                                    className="rounded-xl bg-green-600 text-white hover:bg-green-700"
                                    size="sm"
                                    type="button"
                                    onClick={handleDownloadPDF}
                                    disabled={downloadingPDF}
                                >
                                    <FiDownload className="w-4 h-4 mr-2" />
                                    {downloadingPDF
                                        ? "Загрузка..."
                                        : "Скачать PDF"}
                                </Button>
                            ) : (
                                <Button
                                    className="rounded-xl bg-green-600 text-white hover:bg-green-700"
                                    size="sm"
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(true)}
                                >
                                    <FiUpload className="w-4 h-4 mr-2" />
                                    Загрузить PDF
                                </Button>
                            )}
                        </>
                    )}
                    {contract &&
                        id &&
                        (contract?.is_terminated === 1 ? (
                            <Button
                                className="rounded-xl bg-gray-100 text-gray-600 cursor-default"
                                size="sm"
                                type="button"
                                disabled
                            >
                                Расторгнутый
                            </Button>
                        ) : (
                            <>
                                <Button
                                    className="rounded-xl bg-maintx text-white hover:bg-maintx/90"
                                    size="sm"
                                    type="button"
                                    onClick={openPaymentModal}
                                >
                                    <MdPayment className="w-4 h-4 mr-2" />
                                    Оплатить
                                </Button>
                                <Button
                                    className="rounded-xl bg-black text-white hover:bg-black/80"
                                    size="sm"
                                    type="button"
                                    onClick={() =>
                                        navigate(`/contracts/${id}/edit`)
                                    }
                                >
                                    Изменить
                                </Button>
                            </>
                        ))}
                </div>
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

            <CustomModal
                showTrigger={false}
                open={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                title="Загрузить PDF контракт"
                confirmText="Загрузить"
                cancelText="Отмена"
                confirmBg="bg-green-600"
                confirmBgHover="bg-green-700"
                onConfirm={handleUploadPDF}
                onCancel={handleCancelUpload}
                size="md"
                showCloseButton={true}
                confirmDisabled={!selectedFile || uploading}
            >
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="pdf-upload-modal"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Выберите PDF файл
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="pdf-upload-modal"
                        />
                        <label htmlFor="pdf-upload-modal">
                            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                                <div className="text-center">
                                    <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        {selectedFile
                                            ? selectedFile.name
                                            : "Нажмите для выбора файла"}
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>
                    {selectedFile && (
                        <div className="text-xs text-gray-500">
                            Размер файла:{" "}
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                    )}
                </div>
            </CustomModal>

            <PaymentModal
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                initialContractId={id ? Number(id) : undefined}
                contractDisabled={true}
                onSuccess={() => {
                    if (id) {
                        fetchContractById(Number(id)).then(setContract);
                    }
                }}
            />
        </div>
    );
};

export default ContractDetailsPage;
