import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CustomPagination from "@/components/ui/custom-pagination";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Room, fetchRooms, deleteRoom, fetchFloors, Floor } from "./data";
import AddRoomModal from "@/pages/Rooms/AddRoom";
import EditRoomModal from "@/pages/Rooms/EditRoom";
import CustomModal from "@/components/ui/custom-modal";
import { CustomCombobox } from "@/components/ui/custom-form";
import { formatDateTime } from "@/utils/formatters";
import { HiDotsVertical } from "react-icons/hi";
import { GrEdit } from "react-icons/gr";
import { CiTrash } from "react-icons/ci";

const RoomsPage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(
        undefined
    );
    const [floors, setFloors] = useState<Floor[]>([]);
    const [editRoomId, setEditRoomId] = useState<number | null>(null);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [roomToDelete, setRoomToDelete] = useState<{
        id: number;
        number: number;
    } | null>(null);

    useEffect(() => {
        const loadFloors = async () => {
            const floorsData = await fetchFloors();
            setFloors(floorsData);
        };
        loadFloors();
    }, []);

    const loadRooms = async (page: number, floorId?: number) => {
        try {
            setLoading(true);
            const { rooms, totalPages } = await fetchRooms(page, 10, floorId);
            setRooms(rooms);
            setTotalPages(totalPages || 1);
        } catch (error) {
            // error already handled in fetchRooms
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRooms(currentPage, selectedFloorId);
    }, [currentPage, selectedFloorId]);

    const handlePageChange = (page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handleFloorChange = (value: string) => {
        const floorId = value ? Number(value) : undefined;
        setSelectedFloorId(floorId);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const floorOptions = [
        { value: "", label: "Все этажи" },
        ...floors.map((floor) => ({
            value: floor.floor_id.toString(),
            label: `Этаж ${floor.floor_number}`,
        })),
    ];

    const handleRoomCreated = () => {
        loadRooms(currentPage, selectedFloorId);
    };

    const handleOpenEdit = (roomId: number) => {
        setEditRoomId(roomId);
        setIsEditOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false);
        setEditRoomId(null);
    };

    const handleRoomUpdated = () => {
        loadRooms(currentPage, selectedFloorId);
    };

    const openDeleteModal = (room: { id: number; number: number }) => {
        setRoomToDelete({ id: room.id, number: room.number });
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!roomToDelete) return;

        try {
            await deleteRoom(roomToDelete.id);
            setLoading(true);
            await loadRooms(currentPage, selectedFloorId);
            setIsDeleteOpen(false);
            setRoomToDelete(null);
        } catch (error) {
            // Error already handled in deleteRoom
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteOpen(false);
        setRoomToDelete(null);
    };

    return (
        <div className="space-y-6 ">
            <div className="space-y-4  flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Все комнаты
                </h1>
                <AddRoomModal onCreated={handleRoomCreated} />
            </div>

            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <CardHeader className="pb-4">
                    <div className="flex w-full justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Список комнат
                        </h2>
                        <CustomCombobox
                            label=""
                            placeholder="Выберите этаж"
                            value={selectedFloorId?.toString() || ""}
                            onChange={handleFloorChange}
                            options={floorOptions}
                        />
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
                                    Номер комнаты
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Этаж
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Тип комнаты
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Количество кроватей
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
                            ) : rooms.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        Комнаты не найдены
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room, idx) => (
                                    <TableRow
                                        key={room.room_id}
                                        className="border-dashed border-gray-200 hover:bg-gray-50"
                                    >
                                        <TableCell className="text-gray-700 font-medium text-center">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="text-gray-700 font-medium text-center">
                                            {room.room_number}
                                        </TableCell>
                                        <TableCell className="text-gray-700 text-center">
                                            Этаж {room.floor_number}
                                        </TableCell>
                                        <TableCell className="text-gray-700 text-center">
                                            {room.room_type_text}
                                        </TableCell>
                                        <TableCell className="text-gray-700 text-center">
                                            {room.beds_count}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={
                                                    room.is_active === 1
                                                        ? "success"
                                                        : "warning"
                                                }
                                                className="max-w-[110px]"
                                            >
                                                {room.is_active_text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm text-center">
                                            {formatDateTime(room.created_at)}
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
                                                                room.room_id
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
                                                                id: room.room_id,
                                                                number: room.room_number,
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
            </Card>

            <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-4"
            />

            <EditRoomModal
                roomId={editRoomId}
                isOpen={isEditOpen}
                onClose={handleCloseEdit}
                onUpdated={handleRoomUpdated}
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
                        Вы уверены, что хотите удалить комнату{" "}
                        <span className="font-semibold text-gray-900">
                            {roomToDelete?.number}
                        </span>{" "}
                        ? Это действие нельзя отменить.
                    </p>
                </div>
            </CustomModal>
        </div>
    );
};

export default RoomsPage;
