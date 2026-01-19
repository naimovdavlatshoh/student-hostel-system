import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
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
import { Badge } from "@/components/ui/badge";
import CustomPagination from "@/components/ui/custom-pagination";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bed, fetchBeds, deleteBed, fetchRooms, Room } from "./data";
import AddBedModal from "@/pages/Beds/AddBed";
import EditBedModal from "@/pages/Beds/EditBed";
import CustomModal from "@/components/ui/custom-modal";
import { CustomCombobox } from "@/components/ui/custom-form";
import { formatDateTime } from "@/utils/formatters";
import { HiDotsVertical } from "react-icons/hi";
import { GrEdit } from "react-icons/gr";
import { CiTrash } from "react-icons/ci";

const BedsPage: React.FC = () => {
    const [beds, setBeds] = useState<Bed[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(
        undefined
    );
    const [rooms, setRooms] = useState<Room[]>([]);
    const [editBedId, setEditBedId] = useState<number | null>(null);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [bedToDelete, setBedToDelete] = useState<{
        id: number;
        number: number;
    } | null>(null);

    useEffect(() => {
        const loadRooms = async () => {
            const roomsData = await fetchRooms();
            setRooms(roomsData);
        };
        loadRooms();
    }, []);

    const loadBeds = async (page: number, limit: number, roomId?: number) => {
        try {
            setLoading(true);
            const { beds, totalPages } = await fetchBeds(page, limit, roomId);
            setBeds(beds);
            setTotalPages(totalPages || 1);
        } catch (error) {
            // error already handled in fetchBeds
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBeds(currentPage, itemsPerPage, selectedRoomId);
    }, [currentPage, itemsPerPage, selectedRoomId]);

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

    const handleRoomChange = (value: string) => {
        const roomId = value ? Number(value) : undefined;
        setSelectedRoomId(roomId);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const roomOptions = [
        { value: "", label: "Все комнаты" },
        ...rooms.map((room) => ({
            value: room.room_id.toString(),
            label: `Комната ${room.room_number} (Этаж ${room.floor_number})`,
        })),
    ];

    const handleBedCreated = () => {
        loadBeds(currentPage, itemsPerPage, selectedRoomId);
    };

    const handleOpenEdit = (bedId: number) => {
        setEditBedId(bedId);
        setIsEditOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false);
        setEditBedId(null);
    };

    const handleBedUpdated = () => {
        loadBeds(currentPage, itemsPerPage, selectedRoomId);
    };

    const openDeleteModal = (bed: { id: number; number: number }) => {
        setBedToDelete({ id: bed.id, number: bed.number });
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!bedToDelete) return;

        try {
            await deleteBed(bedToDelete.id);
            setLoading(true);
            await loadBeds(currentPage, itemsPerPage, selectedRoomId);
            setIsDeleteOpen(false);
            setBedToDelete(null);
        } catch (error) {
            // Error already handled in deleteBed
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteOpen(false);
        setBedToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Все койки
                </h1>
                <AddBedModal onCreated={handleBedCreated} />
            </div>

            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <CardHeader className="pb-4">
                    <div className="flex w-full justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Список коек
                        </h2>
                        <CustomCombobox
                            label=""
                            className="w-[300px]"
                            placeholder="Выберите комнату"
                            value={selectedRoomId?.toString() || ""}
                            onChange={handleRoomChange}
                            options={roomOptions}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table className="table-auto w-full">
                        <TableHeader className="bg-mainbg/10">
                            <TableRow>
                                <TableHead className="text-maintx text-center">
                                    Номер койки
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Комната
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Этаж
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Тип койки
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Статус
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Дата создания
                                </TableHead>
                                <TableHead className="text-right text-maintx">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8"
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span className="text-gray-500">
                                                Загрузка...
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : beds.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        Койки не найдены
                                    </TableCell>
                                </TableRow>
                            ) : (
                                beds.map((bed) => (
                                    <TableRow
                                        key={bed.bed_id}
                                        className="border-dashed border-gray-200 hover:bg-gray-50"
                                    >
                                        <TableCell className="text-gray-700 font-medium text-center">
                                            {bed.bed_number}
                                        </TableCell>
                                        <TableCell className="text-gray-700 text-center">
                                            Комната {bed.room_number}
                                        </TableCell>
                                        <TableCell className="text-gray-700 text-center">
                                            Этаж {bed.floor_number}
                                        </TableCell>
                                        <TableCell className="text-gray-700 text-center">
                                            {bed.bed_type_text}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={
                                                    bed.is_active === 1
                                                        ? "success"
                                                        : "warning"
                                                }
                                                className="max-w-[110px]"
                                            >
                                                {bed.is_active_text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm text-center">
                                            {formatDateTime(bed.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full border-none outline-none focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0"
                                                    >
                                                        <HiDotsVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 cursor-pointer"
                                                        onClick={() =>
                                                            handleOpenEdit(
                                                                bed.bed_id
                                                            )
                                                        }
                                                    >
                                                        <GrEdit className="w-4 h-4" />
                                                        Редактировать
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                                        onClick={() =>
                                                            openDeleteModal({
                                                                id: bed.bed_id,
                                                                number: bed.bed_number,
                                                            })
                                                        }
                                                    >
                                                        <CiTrash className="h-4 w-4" />
                                                        Удалить
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
                        <label htmlFor="" className="text-gray-500 text-sm">
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

            <EditBedModal
                bedId={editBedId}
                isOpen={isEditOpen}
                onClose={handleCloseEdit}
                onUpdated={handleBedUpdated}
            />

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
                        Вы уверены, что хотите удалить койку{" "}
                        <span className="font-semibold text-gray-900">
                            {bedToDelete?.number}
                        </span>{" "}
                        ? Это действие нельзя отменить.
                    </p>
                </div>
            </CustomModal>
        </div>
    );
};

export default BedsPage;
