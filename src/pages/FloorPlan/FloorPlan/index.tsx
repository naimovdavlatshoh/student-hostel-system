import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    fetchFloorPlan,
    Floor,
    Room,
    Bed,
    fetchContractByBed,
    ContractByBed,
} from "./data";
import { LuBedSingle } from "react-icons/lu";
import { RiArrowGoBackLine } from "react-icons/ri";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";

const FloorPlanPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode");
    const updateContractId = searchParams.get("contractId");
    const isUpdateContractMode = mode === "updateContract";
    const [floors, setFloors] = useState<Floor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [contractLoading, setContractLoading] = useState(false);
    const [contractData, setContractData] = useState<ContractByBed | null>(
        null
    );
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedBedForCreate, setSelectedBedForCreate] = useState<{
        bed: Bed;
        room: Room;
        floor: Floor;
    } | null>(null);
    const [bedFilter, setBedFilter] = useState<"all" | "top" | "bottom">("all");

    useEffect(() => {
        const loadFloorPlan = async () => {
            try {
                setLoading(true);
                const data = await fetchFloorPlan();
                setFloors(data);
            } catch (error) {
                // Error already handled in fetchFloorPlan
            } finally {
                setLoading(false);
            }
        };

        loadFloorPlan();
    }, []);

    const handleBedClick = async (bed: Bed, room: Room, floor: Floor) => {
        // Если койка свободна (bed_status === 0)
        if (bed.bed_status === 0) {
            setSelectedBedForCreate({ bed, room, floor });
            setCreateModalOpen(true);
            return;
        }

        // Иначе показать sheet с существующим контрактом
        setSheetOpen(true);
        setContractLoading(true);
        setContractData(null);
        const data = await fetchContractByBed(bed.bed_id);
        setContractData(data);
        setContractLoading(false);
    };

    const handleCreateOrSelectBed = () => {
        if (!selectedBedForCreate) return;
        const { bed, room, floor } = selectedBedForCreate;

        const params = new URLSearchParams({
            bed_id: bed.bed_id.toString(),
            room_id: bed.room_id.toString(),
            room_number: room.room_number.toString(),
            floor_number: floor.floor_number.toString(),
        });

        if (isUpdateContractMode && updateContractId) {
            navigate(
                `/contracts/${updateContractId}/edit?${params.toString()}`
            );
        } else {
            navigate(`/contracts/create?${params.toString()}`);
        }

        setCreateModalOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-gray-500">
                        Загрузка планировки...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-6 pt-4 pb-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => navigate(-1)}
                            className="rounded-xl"
                            size={"sm"}
                        >
                            <RiArrowGoBackLine className="w-6 h-6" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Планировка
                            </h1>
                            <p className="text-xs text-gray-500 mt-1">
                                Схема расположения этажей, комнат и коек
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setBedFilter("all")}
                            className={cn(
                                "rounded-xl",
                                bedFilter === "all"
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                            size={"sm"}
                        >
                            Все
                        </Button>
                        <Button
                            onClick={() => setBedFilter("top")}
                            className={cn(
                                "rounded-xl",
                                bedFilter === "top"
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                            size={"sm"}
                        >
                            Верхние
                        </Button>
                        <Button
                            onClick={() => setBedFilter("bottom")}
                            className={cn(
                                "rounded-xl",
                                bedFilter === "bottom"
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                            size={"sm"}
                        >
                            Нижние
                        </Button>
                    </div>
                </div>
            </div>

            {floors.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                        <CardContent className="p-12 text-center">
                            <div className="text-gray-400 text-lg">
                                Планировка не найдена
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden px-6 pb-6">
                    <div className="h-full flex flex-col gap-4">
                        {floors.map((floor) => (
                            <Card
                                key={floor.floor_id}
                                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-0"
                            >
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2 pt-3 px-4 border-b-2 border-gray-200 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                                <span className="text-lg font-bold text-gray-800">
                                                    {floor.floor_number}
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">
                                                    Этаж {floor.floor_number}
                                                </h2>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    {floor.rooms_count} комнат
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    floor.is_active === 1
                                                        ? "success"
                                                        : "warning"
                                                }
                                                className="text-xs px-2 py-0.5"
                                            >
                                                {floor.is_active_text}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
                                    {floor.rooms.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400 flex-1 flex items-center justify-center">
                                            <div className="text-lg mb-2">
                                                На этом этаже нет комнат
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-h-0 flex flex-col">
                                            {/* Pastda xonalar */}
                                            <div className="flex gap-1 p-2 flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
                                                {floor.rooms.map((room) => {
                                                    const bedsCount =
                                                        room.beds.length;
                                                    let gridCols =
                                                        "grid-cols-1";
                                                    if (bedsCount <= 2) {
                                                        gridCols =
                                                            "grid-cols-1";
                                                    } else if (bedsCount <= 4) {
                                                        gridCols =
                                                            "grid-cols-2";
                                                    } else {
                                                        gridCols =
                                                            "grid-cols-2";
                                                    }

                                                    // Bedlarni tartib raqamiga qarab ikkiga bo'lish
                                                    const sortedBeds = [
                                                        ...room.beds,
                                                    ].sort(
                                                        (a, b) =>
                                                            a.bed_number -
                                                            b.bed_number
                                                    );
                                                    const halfIndex = Math.ceil(
                                                        sortedBeds.length / 2
                                                    );
                                                    const leftBedsRaw =
                                                        sortedBeds.slice(
                                                            0,
                                                            halfIndex
                                                        );
                                                    const rightBedsRaw =
                                                        sortedBeds.slice(
                                                            halfIndex
                                                        );

                                                    // Har bir qismda juft bedlar yuqorida, toq bedlar pastda
                                                    const leftBedsSorted =
                                                        leftBedsRaw.sort(
                                                            (a, b) => {
                                                                const aIsEven =
                                                                    a.bed_number %
                                                                        2 ===
                                                                    0;
                                                                const bIsEven =
                                                                    b.bed_number %
                                                                        2 ===
                                                                    0;
                                                                if (
                                                                    aIsEven &&
                                                                    !bIsEven
                                                                )
                                                                    return -1; // Juftlar yuqorida
                                                                if (
                                                                    !aIsEven &&
                                                                    bIsEven
                                                                )
                                                                    return 1; // Toqlar pastda
                                                                return (
                                                                    a.bed_number -
                                                                    b.bed_number
                                                                ); // Bir xil turda tartib raqamiga qarab
                                                            }
                                                        );

                                                    const rightBedsSorted =
                                                        rightBedsRaw.sort(
                                                            (a, b) => {
                                                                const aIsEven =
                                                                    a.bed_number %
                                                                        2 ===
                                                                    0;
                                                                const bIsEven =
                                                                    b.bed_number %
                                                                        2 ===
                                                                    0;
                                                                if (
                                                                    aIsEven &&
                                                                    !bIsEven
                                                                )
                                                                    return -1; // Juftlar yuqorida
                                                                if (
                                                                    !aIsEven &&
                                                                    bIsEven
                                                                )
                                                                    return 1; // Toqlar pastda
                                                                return (
                                                                    a.bed_number -
                                                                    b.bed_number
                                                                ); // Bir xil turda tartib raqamiga qarab
                                                            }
                                                        );

                                                    // Filter funksiyasi - bedni tanlangan filterni qanoatlantirishini tekshirish
                                                    const isBedFiltered = (
                                                        bed: Bed
                                                    ) => {
                                                        if (bedFilter === "all")
                                                            return true;
                                                        if (bedFilter === "top")
                                                            return (
                                                                bed.bed_number %
                                                                    2 ===
                                                                0
                                                            );
                                                        if (
                                                            bedFilter ===
                                                            "bottom"
                                                        )
                                                            return (
                                                                bed.bed_number %
                                                                    2 ===
                                                                1
                                                            );
                                                        return true;
                                                    };

                                                    const leftBeds =
                                                        leftBedsSorted;
                                                    const rightBeds =
                                                        rightBedsSorted;

                                                    // Dinamik kenglik - xonalar soniga qarab
                                                    const totalRooms =
                                                        floor.rooms.length;
                                                    const gapRem = 0.25;
                                                    const totalGap =
                                                        (totalRooms - 1) *
                                                        gapRem;
                                                    const calculatedWidth = `calc((100% - ${totalGap}rem) / ${totalRooms})`;

                                                    return (
                                                        <div
                                                            key={room.room_id}
                                                            className="border-2 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer flex flex-col flex-shrink-0 min-h-[40px]"
                                                            style={{
                                                                width: calculatedWidth,
                                                                minWidth:
                                                                    "4rem",
                                                            }}
                                                        >
                                                            {/* Room header */}
                                                            <div className="border-b-2 border-gray-400 px-1 py-0.5 text-center flex-shrink-0">
                                                                <span className="text-xs font-bold text-gray-900">
                                                                    {
                                                                        room.room_number
                                                                    }
                                                                </span>
                                                            </div>

                                                            {/* Xona ikkiga bo'lingan: chap va o'ng */}
                                                            <div className="flex flex-1 p-0.5 gap-0.5 min-h-0">
                                                                {/* Chap qism */}
                                                                <div className="flex-1 border border-gray-300 rounded p-0.5 bg-blue-100 min-h-0 flex flex-col">
                                                                    <div
                                                                        className={`grid ${gridCols} gap-0.5 flex-1 auto-rows-fr`}
                                                                    >
                                                                        {leftBeds.map(
                                                                            (
                                                                                bed
                                                                            ) => {
                                                                                const isFiltered =
                                                                                    isBedFiltered(
                                                                                        bed
                                                                                    );
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            bed.bed_id
                                                                                        }
                                                                                        className={cn(
                                                                                            "rounded flex flex-col items-center justify-center text-xs font-bold group min-h-[40px]",
                                                                                            !isFiltered &&
                                                                                                "opacity-50 cursor-not-allowed",
                                                                                            isFiltered &&
                                                                                                "cursor-pointer",
                                                                                            !isFiltered
                                                                                                ? "bg-gray-400 text-gray-600"
                                                                                                : bed.bed_status ===
                                                                                                  0
                                                                                                ? "bg-mainbg text-white"
                                                                                                : bed.bed_status ===
                                                                                                  1
                                                                                                ? "bg-yellow-500 text-yellow-900"
                                                                                                : "bg-red-500 text-white"
                                                                                        )}
                                                                                        onClick={() => {
                                                                                            if (
                                                                                                isFiltered
                                                                                            ) {
                                                                                                handleBedClick(
                                                                                                    bed,
                                                                                                    room,
                                                                                                    floor
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <LuBedSingle
                                                                                            className={cn(
                                                                                                "w-4 h-4 group-hover:hidden",
                                                                                                isFiltered
                                                                                                    ? "text-white"
                                                                                                    : "text-gray-600"
                                                                                            )}
                                                                                        />
                                                                                        <span
                                                                                            className={cn(
                                                                                                "hidden group-hover:block font-semibold",
                                                                                                isFiltered
                                                                                                    ? "text-white"
                                                                                                    : "text-gray-600"
                                                                                            )}
                                                                                        >
                                                                                            {
                                                                                                bed.bed_number
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* O'ng qism */}
                                                                <div className="flex-1 border border-gray-300 rounded p-0.5 bg-purple-100 min-h-0 flex flex-col">
                                                                    <div
                                                                        className={`grid ${gridCols} gap-0.5 flex-1 auto-rows-fr`}
                                                                    >
                                                                        {rightBeds.map(
                                                                            (
                                                                                bed
                                                                            ) => {
                                                                                const isFiltered =
                                                                                    isBedFiltered(
                                                                                        bed
                                                                                    );
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            bed.bed_id
                                                                                        }
                                                                                        className={cn(
                                                                                            "rounded flex flex-col items-center justify-center text-xs font-bold group min-h-[40px]",
                                                                                            !isFiltered &&
                                                                                                "opacity-50 cursor-not-allowed",
                                                                                            isFiltered &&
                                                                                                "cursor-pointer",
                                                                                            !isFiltered
                                                                                                ? "bg-gray-400 text-gray-600"
                                                                                                : bed.bed_status ===
                                                                                                  0
                                                                                                ? "bg-mainbg text-white"
                                                                                                : bed.bed_status ===
                                                                                                  1
                                                                                                ? "bg-yellow-500 text-yellow-900"
                                                                                                : "bg-red-500 text-white"
                                                                                        )}
                                                                                        onClick={() => {
                                                                                            if (
                                                                                                isFiltered
                                                                                            ) {
                                                                                                handleBedClick(
                                                                                                    bed,
                                                                                                    room,
                                                                                                    floor
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <LuBedSingle
                                                                                            className={cn(
                                                                                                "w-4 h-4 group-hover:hidden",
                                                                                                isFiltered
                                                                                                    ? "text-white"
                                                                                                    : "text-gray-600"
                                                                                            )}
                                                                                        />
                                                                                        <span
                                                                                            className={cn(
                                                                                                "hidden group-hover:block font-semibold",
                                                                                                isFiltered
                                                                                                    ? "text-white"
                                                                                                    : "text-gray-600"
                                                                                            )}
                                                                                        >
                                                                                            {
                                                                                                bed.bed_number
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md [&>button:last-child]:hidden"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <SheetHeader className="text-left mb-4">
                        <SheetTitle>Информация по койке</SheetTitle>
                        <SheetDescription>
                            Детали договора и студента
                        </SheetDescription>
                    </SheetHeader>

                    {contractLoading ? (
                        <div className="flex items-center justify-center py-10 space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-gray-500 text-sm">
                                Загрузка...
                            </span>
                        </div>
                    ) : !contractData ? (
                        <div className="text-sm text-gray-500">
                            Нет данных по договору
                        </div>
                    ) : (
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden border">
                                    <img
                                        src={
                                            contractData.student_image_url ||
                                            "/avatar-1.webp"
                                        }
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {contractData.student_full_name}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        {contractData.university_name} •{" "}
                                        {contractData.university_group_name}
                                    </div>
                                </div>
                            </div>

                            {/* Личная информация и учеба */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                    <div className="text-xs text-gray-500">
                                        Паспорт / ПИНФЛ
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        {contractData.passport_series}
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        ПИНФЛ: {contractData.student_pinfl}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Дата рождения
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        {contractData.date_of_birth}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                    <div className="text-xs text-gray-500">
                                        Обучение
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        Факультет: {contractData.faculty}
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        Направление:{" "}
                                        {contractData.field_of_study}
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        Курс: {contractData.course_level}
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        Срок обучения:{" "}
                                        {contractData.study_period} год
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-xs text-gray-500">
                                        Койка
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        Этаж {contractData.floor_number},
                                        Комната {contractData.room_number},
                                        Койка {contractData.bed_number}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-xs text-gray-500">
                                        Контракт
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        № {contractData.contract_number}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {contractData.contract_start_date} →{" "}
                                        {contractData.contract_end_date}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Контакты и адрес */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs text-gray-500">
                                        Контакты
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        Телефон: {contractData.phone_number}
                                    </div>
                                    {contractData.additional_phone_number && (
                                        <div className="text-xs text-gray-900">
                                            Доп.:{" "}
                                            {
                                                contractData.additional_phone_number
                                            }
                                        </div>
                                    )}
                                    {contractData.owner_additional_phone_number && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {
                                                contractData.owner_additional_phone_number
                                            }
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">
                                        Адрес
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        {contractData.region_name}
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        {contractData.district_name}
                                    </div>
                                    <div className="text-xs text-gray-900">
                                        {contractData.address}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Финансовая информация */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs text-gray-500">
                                        Ежемесячно
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {contractData.contract_monthly_payment.toLocaleString()}{" "}
                                        сум
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">
                                        Итого
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {contractData.contract_total_price.toLocaleString()}{" "}
                                        сум
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                        Статус контракта
                                    </div>
                                    <Badge
                                        className={cn(
                                            "px-2 py-1 text-xs font-semibold",
                                            contractData.contract_status === 1
                                                ? "bg-orange-100 text-orange-700"
                                                : contractData.contract_status ===
                                                  2
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                        )}
                                    >
                                        {contractData.contract_status === 1
                                            ? "Контракт не подписан"
                                            : contractData.contract_status === 2
                                            ? "Контракт подписан"
                                            : contractData.contract_status_text}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">
                                        Оплата
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {contractData.payment_status_text}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="text-xs text-gray-500">
                                    График платежей
                                </div>
                                <div className="max-h-40 overflow-auto space-y-2 pr-1">
                                    {contractData.plan.payments.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex justify-between text-xs bg-gray-50 rounded-lg p-2"
                                        >
                                            <div className="text-gray-700">
                                                {p.monthly_payment_date}
                                            </div>
                                            <div className="text-gray-900 font-semibold">
                                                {p.monthly_fee.toLocaleString()}/ <span className={p.monthly_fee === p.payment_amount ? "text-green-500" : p.payment_amount > 0 ? "text-yellow-500" : "text-red-600"}>{p.payment_amount>0? p.payment_amount.toLocaleString() : 0}</span>{" "}
                                                сум
                                            </div>
                                            <div
                                                className={cn(
                                                    "px-2 py-0.5 rounded-full",
                                                    p.payment_status === 1
                                                        ? "bg-green-100 text-green-700"
                                                        : p.payment_status === 2
                                                        ? "bg-yellow-100 text-yellow-700"
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

                            <SheetClose asChild>
                                <Button
                                    className="w-full focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                                    variant="outline"
                                >
                                    Закрыть
                                </Button>
                            </SheetClose>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {selectedBedForCreate && (
                <CustomModal
                    showTrigger={false}
                    open={createModalOpen}
                    onOpenChange={setCreateModalOpen}
                    title={
                        isUpdateContractMode
                            ? "Изменить койку"
                            : "Создать контракт"
                    }
                    confirmText={
                        isUpdateContractMode
                            ? "Изменить на эту"
                            : "Создать контракт"
                    }
                    cancelText="Отмена"
                    confirmBg="bg-black"
                    confirmBgHover="bg-black/80"
                    onConfirm={handleCreateOrSelectBed}
                    onCancel={() => setSelectedBedForCreate(null)}
                    size="md"
                    showCloseButton={false}
                >
                    <div className="space-y-3 text-sm">
                        <div className="font-semibold text-gray-900">
                            Койка {selectedBedForCreate.bed.bed_number} (
                            {selectedBedForCreate.bed.bed_type_text})
                        </div>
                        <div className="text-gray-700">
                            Этаж {selectedBedForCreate.floor.floor_number},
                            Комната {selectedBedForCreate.room.room_number}
                        </div>
                        <div className="text-xs text-gray-500">
                            Эта койка свободна.{" "}
                            {isUpdateContractMode
                                ? "Вы хотите изменить контракт на эту койку?"
                                : "Вы хотите создать новый контракт для этой койки?"}
                        </div>
                    </div>
                </CustomModal>
            )}
        </div>
    );
};

export default FloorPlanPage;
