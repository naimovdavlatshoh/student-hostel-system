import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomCombobox } from "@/components/ui/custom-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProgressAuto } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/ui/custom-modal";
import { CiTrash } from "react-icons/ci";
import {
    Student,
    Document,
    UploadFiles,
    fetchStudentData,
    fetchRegions,
    fetchDistricts,
    getAvatarFromDocuments,
    formatDate,
    deleteDocument,
    uploadDocuments,
    isUploadDisabled,
} from "./data";
import { RiArrowGoBackLine } from "react-icons/ri";
import { BASE_URL } from "@/services/data";
import { formatDateTime } from "@/utils/formatters";

const Account = () => {
    const { id } = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [regions, setRegions] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [avatarSrc, setAvatarSrc] = useState<string>("/avatar-1.webp");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("info");
    const navigate = useNavigate();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<UploadFiles>({
        passport_copy: null,
        student_photo: null,
        other_document: null,
    });

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const [studentRes, regionsRes] = await Promise.all([
                    fetchStudentData(id),
                    fetchRegions(),
                ]);

                if (studentRes) {
                    setStudent(studentRes);
                    setRegions(regionsRes);

                    const avatarUrl = getAvatarFromDocuments(
                        studentRes.documents
                    );
                    if (avatarUrl) {
                        setAvatarSrc(avatarUrl);
                    }

                    if (studentRes.region_id) {
                        const districtsRes = await fetchDistricts(
                            studentRes.region_id
                        );
                        setDistricts(districtsRes);
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const openDeleteModal = (doc: { id: number; name: string }) => {
        setDocumentToDelete({ id: doc.id, name: doc.name });
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!documentToDelete || !id) return;

        try {
            await deleteDocument(documentToDelete.id);
            const studentRes = await fetchStudentData(id);
            if (studentRes) {
                setStudent(studentRes);
                const avatarUrl = getAvatarFromDocuments(studentRes.documents);
                if (avatarUrl) {
                    setAvatarSrc(avatarUrl);
                } else {
                    setAvatarSrc("/avatar-1.webp");
                }
            }
            setIsDeleteOpen(false);
            setDocumentToDelete(null);
        } catch (error) {
            // Error already handled in data.ts
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteOpen(false);
        setDocumentToDelete(null);
    };

    const handleFileChange = (
        field: "passport_copy" | "student_photo" | "other_document",
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setUploadFiles((prev) => ({
            ...prev,
            [field]: e.target.files?.[0] || null,
        }));
    };

    const handleUploadDocument = async () => {
        if (isUploadDisabled(uploadFiles) || !id) return;

        try {
            await uploadDocuments(id, uploadFiles);
            const studentRes = await fetchStudentData(id);
            if (studentRes) {
                setStudent(studentRes);
                const avatarUrl = getAvatarFromDocuments(studentRes.documents);
                if (avatarUrl) {
                    setAvatarSrc(avatarUrl);
                } else {
                    setAvatarSrc("/avatar-1.webp");
                }
            }
            setUploadFiles({
                passport_copy: null,
                student_photo: null,
                other_document: null,
            });
            setIsUploadModalOpen(false);
        } catch (error) {
            // Error already handled in data.ts
        }
    };

    const handleCancelUpload = () => {
        setUploadFiles({
            passport_copy: null,
            student_photo: null,
            other_document: null,
        });
        setIsUploadModalOpen(false);
    };

    if (loading) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center">
                <div className="w-[400px]">
                    <ProgressAuto
                        durationMs={500}
                        startDelayMs={10}
                        className="h-1 rounded-full"
                    />
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="h-[80vh] w-full flex justify-center items-center">
                <p className="text-gray-500">Студент не найден</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 ">
                    <Link to="/">
                        <Button className="rounded-xl" size={"sm"}>
                            <RiArrowGoBackLine className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Аккаунт -{" "}
                        <span className="text-maintx">
                            {student.student_name} {student.student_surname}
                        </span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6 lg:col-span-1">
                    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                        <CardContent className="space-y-4 py-14">
                            <div className="flex flex-col items-center space-y-8">
                                <div className="relative w-48 h-48 rounded-full border-2 border-dashed border-gray-300 overflow-hidden p-1.5 bg-gray-50">
                                    <img
                                        src={avatarSrc}
                                        alt="avatar"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                                <div className="text-center text-md font-semibold text-gray-800">
                                    <p>
                                        {student.student_name}{" "}
                                        {student.student_surname}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold text-gray-900">
                                Информация
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Регион</span>
                                <span className="text-gray-900 font-medium">
                                    {student.region_name || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Район</span>
                                <span className="text-gray-900 font-medium">
                                    {student.district_name || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                    Университет
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {student.university_name || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Курс</span>
                                <span className="text-gray-900 font-medium">
                                    {student.course_level || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Статус</span>
                                <span className="text-gray-900 font-medium">
                                    {student.is_blocked === 0
                                        ? "Активный"
                                        : "Заблокирован"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                    Статус в терминале
                                </span>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                        student.available_in_terminal === 1
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {student.available_in_terminal === 1
                                        ? "загружено"
                                        : "Не загружено"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                    Дата регистрации
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {formatDateTime(student.created_at)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white rounded-2xl shadow-lg border lg:col-span-2 border-gray-100 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex justify-between items-center gap-2">
                            <h1>Данные студента</h1>
                            {activeTab === "info" ? (
                                <Button
                                    onClick={() => navigate(`/user/${id}`)}
                                    className="rounded-xl px-5"
                                    size={"sm"}
                                >
                                    Редактировать данные
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="text-white rounded-xl px-5"
                                    size={"sm"}
                                >
                                    Загрузить документ
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-mainbg/10 p-1 rounded-xl">
                                <TabsTrigger
                                    onClick={() => setActiveTab("info")}
                                    value="info"
                                    className="data-[state=active]:bg-maintx data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg font-medium transition-all duration-200"
                                >
                                    Информация
                                </TabsTrigger>
                                <TabsTrigger
                                    onClick={() => setActiveTab("documents")}
                                    value="documents"
                                    className="data-[state=active]:bg-maintx data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg font-medium transition-all duration-200"
                                >
                                    Документы
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent
                                value="info"
                                className="space-y-6 mt-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Имя
                                            </Label>
                                            <Input
                                                type="text"
                                                value={student.student_name}
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Фамилия
                                            </Label>
                                            <Input
                                                type="text"
                                                value={student.student_surname}
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Отчество
                                            </Label>
                                            <Input
                                                type="text"
                                                value={
                                                    student.student_fathername
                                                }
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Серия паспорта
                                            </Label>
                                            <Input
                                                type="text"
                                                value={student.passport_series}
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Дата рождения
                                            </Label>
                                            <Input
                                                type="text"
                                                value={formatDate(
                                                    student.date_of_birth
                                                )}
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Название университета
                                            </Label>
                                            <Input
                                                type="text"
                                                value={student.university_name}
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <CustomCombobox
                                                label="Регион"
                                                placeholder="Регион"
                                                value={student.region_id.toString()}
                                                onChange={() => {}}
                                                options={regions
                                                    .filter(
                                                        (region: any) =>
                                                            region &&
                                                            region.region_id &&
                                                            region.region_name
                                                    )
                                                    .map((region: any) => ({
                                                        value: region.region_id.toString(),
                                                        label: region.region_name,
                                                    }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <CustomCombobox
                                                label="Район"
                                                placeholder="Район"
                                                value={student.district_id.toString()}
                                                onChange={() => {}}
                                                options={districts
                                                    .filter(
                                                        (district: any) =>
                                                            district &&
                                                            district.district_id &&
                                                            district.district_name
                                                    )
                                                    .map((district: any) => ({
                                                        value: district.district_id.toString(),
                                                        label: district.district_name,
                                                    }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Номер телефона
                                            </Label>
                                            <Input
                                                type="tel"
                                                value={student.phone_number}
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Дополнительный номер телефона
                                                владельца
                                            </Label>
                                            <Input
                                                type="tel"
                                                value={
                                                    student.owner_additional_phone_number ||
                                                    "—"
                                                }
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Дополнительный номер телефона
                                            </Label>
                                            <Input
                                                type="tel"
                                                value={
                                                    student.additional_phone_number ||
                                                    "—"
                                                }
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Курс
                                            </Label>
                                            <Input
                                                type="number"
                                                value={student.course_level}
                                                readOnly
                                                className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent
                                value="documents"
                                className="space-y-4 mt-6"
                            >
                                {student.documents &&
                                student.documents.length > 0 ? (
                                    <div className="space-y-4">
                                        {student.documents.map(
                                            (doc: Document) => {
                                                const fullUrl =
                                                    BASE_URL +
                                                    doc.document_full_path;

                                                return (
                                                    <Card
                                                        key={doc.document_id}
                                                        className="border border-gray-200"
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-gray-900">
                                                                        {
                                                                            doc.document_type_text
                                                                        }
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                        {doc.document_format.toUpperCase()}{" "}
                                                                        •{" "}
                                                                        {formatDate(
                                                                            doc.created_at
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <a
                                                                        href={
                                                                            fullUrl
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition-colors"
                                                                    >
                                                                        {doc.document_format ===
                                                                        "pdf"
                                                                            ? "Открыть PDF"
                                                                            : "Открыть"}
                                                                    </a>
                                                                    <button
                                                                        onClick={() =>
                                                                            openDeleteModal(
                                                                                {
                                                                                    id: doc.document_id,
                                                                                    name: doc.document_type_text,
                                                                                }
                                                                            )
                                                                        }
                                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <CiTrash className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Документы не найдены
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

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
                        Вы уверены, что хотите удалить документ{" "}
                        <span className="font-semibold text-gray-900">
                            {documentToDelete?.name}
                        </span>
                        ? Это действие нельзя отменить.
                    </p>
                </div>
            </CustomModal>

            <CustomModal
                showTrigger={false}
                open={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                title="Загрузить документ"
                confirmText="Загрузить"
                cancelText="Отмена"
                confirmBg="bg-maintx"
                confirmBgHover="bg-maintx/80"
                confirmDisabled={isUploadDisabled(uploadFiles)}
                onConfirm={handleUploadDocument}
                onCancel={handleCancelUpload}
                size="lg"
                showCloseButton={false}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Копия паспорта (JPEG)
                        </Label>
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                                handleFileChange("passport_copy", e)
                            }
                            className="h-12 rounded-xl border-gray-200 bg-gray-50"
                        />
                        {uploadFiles.passport_copy && (
                            <p className="text-xs text-gray-500 mt-1">
                                Выбран файл: {uploadFiles.passport_copy.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Фото студента (JPG, JPEG)
                        </Label>
                        <Input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) =>
                                handleFileChange("student_photo", e)
                            }
                            className="h-12 rounded-xl border-gray-200 bg-gray-50"
                        />
                        {uploadFiles.student_photo && (
                            <p className="text-xs text-gray-500 mt-1">
                                Выбран файл: {uploadFiles.student_photo.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Другой документ (PDF, JPG, JPEG)
                        </Label>
                        <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                                handleFileChange("other_document", e)
                            }
                            className="h-12 rounded-xl border-gray-200 bg-gray-50"
                        />
                        {uploadFiles.other_document && (
                            <p className="text-xs text-gray-500 mt-1">
                                Выбран файл: {uploadFiles.other_document.name}
                            </p>
                        )}
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};

export default Account;
