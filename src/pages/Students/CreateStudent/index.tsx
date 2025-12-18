import { useEffect, useRef, useState } from "react";
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
import { CustomCombobox } from "@/components/ui/custom-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MdCameraAlt } from "react-icons/md";
import { Link } from "react-router-dom";
import { ProgressAuto } from "@/components/ui/progress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
    FormData,
    fetchRegions,
    fetchDistricts,
    validateFile,
    processDateChange,
    isFormValid,
    createStudent,
} from "./data";
import { RiArrowGoBackLine } from "react-icons/ri";

const CreateStudent = () => {
    const [formData, setFormData] = useState<FormData>({
        student_name: "",
        student_surname: "",
        student_fathername: "",
        passport_series: "",
        date_of_birth: "",
        date_day: "",
        date_month: "",
        date_year: "",
        region_id: "",
        district_id: "",
        phone_number: "",
        owner_additional_phone_number: "",
        additional_phone_number: "",
        university_name: "",
        course_level: "",
        university_group_name: "",
        form_of_education: "",
        study_period: "",
        faculty: "",
        field_of_study: "",
        passport_copy: null,
        student_photo: null,
    });

    const [regions, setRegions] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState<string>("/avatar-1.webp");
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const passportFileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadRegions = async () => {
            const fetchedRegions = await fetchRegions();
            setRegions(fetchedRegions);
        };
        loadRegions();

        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (field === "region_id" && value) {
            loadDistricts(value);
            setFormData((prev) => ({
                ...prev,
                district_id: "",
            }));
        }
    };

    const loadDistricts = async (regionId: string) => {
        const fetchedDistricts = await fetchDistricts(regionId);
        setDistricts(fetchedDistricts);
    };

    const handleDateChange = (
        field: "date_day" | "date_month" | "date_year",
        value: string
    ) => {
        const newData = processDateChange(field, value, formData);
        setFormData((prev) => ({
            ...prev,
            ...newData,
        }));
    };

    const handleAvatarClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateFile(file, "image");
        if (!validation.valid) {
            toast.error(validation.error || "Ошибка валидации файла");
            return;
        }

        try {
            setIsUploading(true);
            const url = URL.createObjectURL(file);
            setAvatarSrc(url);
            setFormData((prev) => ({
                ...prev,
                student_photo: file,
                university_group_name: prev.university_group_name || "",
                form_of_education: prev.form_of_education || "",
                study_period: prev.study_period || "",
                faculty: prev.faculty || "",
                field_of_study: prev.field_of_study || "",
            }));
        } catch (error: any) {
            console.error("Error uploading image:", error);
            toast.error("Ошибка загрузки изображения");
        } finally {
            setIsUploading(false);
        }
    };

    const handlePassportFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateFile(file, "pdf");
        if (!validation.valid) {
            toast.error(validation.error || "Ошибка валидации файла");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            passport_copy: file,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid(formData)) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        try {
            setIsCreating(true);
            await createStudent(formData);
            navigate("/");
            setFormData({
                student_name: "",
                student_surname: "",
                student_fathername: "",
                passport_series: "",
                date_of_birth: "",
                date_day: "",
                date_month: "",
                date_year: "",
                region_id: "",
                district_id: "",
                phone_number: "",
                owner_additional_phone_number: "",
                additional_phone_number: "",
                university_name: "",
                course_level: "",
                university_group_name: "",
                form_of_education: "",
                study_period: "",
                faculty: "",
                field_of_study: "",
                passport_copy: null,
                student_photo: null,
            });
            setAvatarSrc("/avatar-1.webp");
            setDistricts([]);
        } catch (error) {
            // Error already handled in data.ts
        } finally {
            setIsCreating(false);
        }
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 ">
                    <Link to="/">
                        <Button className="rounded-xl" size={"sm"}>
                            <RiArrowGoBackLine className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Создать нового студента
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6 lg:col-span-1">
                    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                        <CardContent className="space-y-4 py-14">
                            <div className="flex flex-col items-center space-y-8">
                                <div
                                    className={`group relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 overflow-hidden p-1.5 bg-gray-50 ${
                                        isUploading
                                            ? "cursor-not-allowed opacity-75"
                                            : "cursor-pointer"
                                    }`}
                                    onClick={handleAvatarClick}
                                    role="button"
                                    aria-label="Загрузить фото"
                                >
                                    {isUploading ? (
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                            <div className="relative">
                                                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <MdCameraAlt className="w-6 h-6 text-blue-600" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <img
                                                src={avatarSrc}
                                                alt="avatar"
                                                className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
                                                <MdCameraAlt className="w-6 h-6 mb-1" />
                                                <span className="text-xs">
                                                    Загрузить фото
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                        disabled={isUploading}
                                    />
                                </div>

                                <div className="text-center text-sm text-gray-500">
                                    <p>*.jpeg, *.jpg макс 3 Мб</p>
                                </div>

                                <div className="w-full space-y-2">
                                    <Label
                                        htmlFor="passport_copy"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Копия паспорта (PDF)
                                    </Label>
                                    <input
                                        ref={passportFileInputRef}
                                        id="passport_copy"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handlePassportFileChange}
                                        className="h-12 rounded-xl border-gray-200 w-full px-3 py-2 border border-input bg-background text-sm file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                    />
                                    {formData.passport_copy && (
                                        <p className="text-xs text-gray-500">
                                            Выбран:{" "}
                                            {formData.passport_copy.name}
                                        </p>
                                    )}
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
                                    {regions.find(
                                        (r: any) =>
                                            r.region_id?.toString() ===
                                            formData.region_id
                                    )?.region_name || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Район</span>
                                <span className="text-gray-900 font-medium">
                                    {districts.find(
                                        (d: any) =>
                                            d.district_id?.toString() ===
                                            formData.district_id
                                    )?.district_name || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                    Университет
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {formData.university_name || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Курс</span>
                                <span className="text-gray-900 font-medium">
                                    {formData.course_level || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Группа</span>
                                <span className="text-gray-900 font-medium">
                                    {formData.university_group_name || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                    Форма обучения
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {formData.form_of_education === "1"
                                        ? "Дневной"
                                        : formData.form_of_education === "2"
                                        ? "Ночной"
                                        : "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                    Срок обучения
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {formData.study_period
                                        ? `${formData.study_period} лет`
                                        : "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Факультет</span>
                                <span className="text-gray-900 font-medium">
                                    {formData.faculty || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                    Направление
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {formData.field_of_study || "—"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white rounded-2xl shadow-lg border lg:col-span-2 border-gray-100 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            Данные студента
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <form
                            id="studentForm"
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="student_name"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Имя
                                        </Label>
                                        <Input
                                            id="student_name"
                                            type="text"
                                            placeholder="Введите имя"
                                            value={formData.student_name}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "student_name",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="student_surname"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Фамилия
                                        </Label>
                                        <Input
                                            id="student_surname"
                                            type="text"
                                            placeholder="Введите фамилию"
                                            value={formData.student_surname}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "student_surname",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="student_fathername"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Отчество
                                        </Label>
                                        <Input
                                            id="student_fathername"
                                            type="text"
                                            placeholder="Введите отчество"
                                            value={formData.student_fathername}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "student_fathername",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="passport_series"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Серия паспорта
                                        </Label>
                                        <Input
                                            id="passport_series"
                                            type="text"
                                            placeholder="AB1234567"
                                            value={formData.passport_series}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "passport_series",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="date_of_birth"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Дата рождения
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="date_day"
                                                type="text"
                                                placeholder="ДД"
                                                maxLength={2}
                                                value={formData.date_day}
                                                onChange={(e) =>
                                                    handleDateChange(
                                                        "date_day",
                                                        e.target.value
                                                    )
                                                }
                                                className="h-12 rounded-xl border-gray-200 text-center"
                                            />
                                            <Input
                                                id="date_month"
                                                type="text"
                                                placeholder="ММ"
                                                maxLength={2}
                                                value={formData.date_month}
                                                onChange={(e) =>
                                                    handleDateChange(
                                                        "date_month",
                                                        e.target.value
                                                    )
                                                }
                                                className="h-12 rounded-xl border-gray-200 text-center"
                                            />
                                            <Input
                                                id="date_year"
                                                type="text"
                                                placeholder="ГГГГ"
                                                maxLength={4}
                                                value={formData.date_year}
                                                onChange={(e) =>
                                                    handleDateChange(
                                                        "date_year",
                                                        e.target.value
                                                    )
                                                }
                                                className="h-12 rounded-xl border-gray-200 text-center"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <CustomCombobox
                                            label="Регион"
                                            placeholder="Выберите регион"
                                            value={formData.region_id}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "region_id",
                                                    value
                                                )
                                            }
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
                                            placeholder={
                                                formData.region_id
                                                    ? "Выберите район"
                                                    : "Сначала выберите регион"
                                            }
                                            value={formData.district_id}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "district_id",
                                                    value
                                                )
                                            }
                                            options={
                                                formData.region_id
                                                    ? districts
                                                          .filter(
                                                              (district: any) =>
                                                                  district &&
                                                                  district.district_id &&
                                                                  district.district_name
                                                          )
                                                          .map(
                                                              (
                                                                  district: any
                                                              ) => ({
                                                                  value: district.district_id.toString(),
                                                                  label: district.district_name,
                                                              })
                                                          )
                                                    : []
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="phone_number"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Номер телефона
                                        </Label>
                                        <Input
                                            id="phone_number"
                                            type="tel"
                                            placeholder="+998901234567"
                                            value={formData.phone_number}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "phone_number",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="owner_additional_phone_number"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Дополнительный номер телефона
                                            владельца
                                        </Label>
                                        <Input
                                            id="owner_additional_phone_number"
                                            type="tel"
                                            placeholder="Владелец номера телефона"
                                            value={
                                                formData.owner_additional_phone_number
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "owner_additional_phone_number",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="additional_phone_number"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Дополнительный номер телефона
                                        </Label>
                                        <Input
                                            id="additional_phone_number"
                                            type="tel"
                                            placeholder="+998901234567"
                                            value={
                                                formData.additional_phone_number
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "additional_phone_number",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="university_name"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Название университета
                                        </Label>
                                        <Input
                                            id="university_name"
                                            type="text"
                                            placeholder="ТГТУ"
                                            value={formData.university_name}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "university_name",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="course_level"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Курс
                                        </Label>
                                        <Input
                                            id="course_level"
                                            type="number"
                                            placeholder="1"
                                            min="1"
                                            max="6"
                                            value={formData.course_level}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "course_level",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="university_group_name"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Группа
                                        </Label>
                                        <Input
                                            id="university_group_name"
                                            type="text"
                                            placeholder="ИС-21"
                                            value={
                                                formData.university_group_name
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "university_group_name",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="form_of_education"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Форма обучения
                                        </Label>
                                        <Select
                                            value={formData.form_of_education}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "form_of_education",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-12 rounded-xl border-gray-200">
                                                <SelectValue placeholder="Выберите форму обучения" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">
                                                    Дневной
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Ночной
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    Заочный
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="study_period"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Срок обучения (лет)
                                        </Label>
                                        <Input
                                            id="study_period"
                                            type="number"
                                            placeholder="4"
                                            min="1"
                                            max="10"
                                            value={formData.study_period}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "study_period",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="faculty"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Факультет
                                        </Label>
                                        <Input
                                            id="faculty"
                                            type="text"
                                            placeholder="TEST"
                                            value={formData.faculty}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "faculty",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="field_of_study"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Направление
                                        </Label>
                                        <Input
                                            id="field_of_study"
                                            type="text"
                                            placeholder="TJT"
                                            value={formData.field_of_study}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "field_of_study",
                                                    e.target.value
                                                )
                                            }
                                            className="h-12 rounded-xl border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4"></div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-end space-x-4">
                        <Link to="/">
                            <Button
                                type="button"
                                variant="outline"
                                className="px-6 py-2 h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Назад
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            form="studentForm"
                            disabled={isCreating || !isFormValid(formData)}
                            className="px-6 py-2 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Создание...</span>
                                </div>
                            ) : (
                                "Создать студента"
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default CreateStudent;
