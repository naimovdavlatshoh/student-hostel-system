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
import { Floor, fetchFloors, deleteFloor } from "./data";
import AddFloorModal from "@/pages/Floors/AddFloor";
import EditFloorModal from "@/pages/Floors/EditFloor";
import CustomModal from "@/components/ui/custom-modal";
import { formatDateTime } from "@/utils/formatters";
import { HiDotsVertical } from "react-icons/hi";
import { GrEdit } from "react-icons/gr";
import { CiTrash } from "react-icons/ci";

const FloorsPage: React.FC = () => {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [editFloorId, setEditFloorId] = useState<number | null>(null);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [floorToDelete, setFloorToDelete] = useState<{
        id: number;
        number: number;
    } | null>(null);

    const loadFloors = async (page: number) => {
        try {
            setLoading(true);
            const { floors, totalPages } = await fetchFloors(page, 10);
            setFloors(floors);
            setTotalPages(totalPages || 1);
        } catch (error) {
            // error already handled in fetchFloors
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFloors(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handleFloorCreated = () => {
        loadFloors(currentPage);
    };

    const handleOpenEdit = (floorId: number) => {
        setEditFloorId(floorId);
        setIsEditOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false);
        setEditFloorId(null);
    };

    const handleFloorUpdated = () => {
        loadFloors(currentPage);
    };

    const openDeleteModal = (floor: { id: number; number: number }) => {
        setFloorToDelete({ id: floor.id, number: floor.number });
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!floorToDelete) return;

        try {
            await deleteFloor(floorToDelete.id);
            setLoading(true);
            await loadFloors(currentPage);
            setIsDeleteOpen(false);
            setFloorToDelete(null);
        } catch (error) {
            // Error already handled in deleteFloor
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteOpen(false);
        setFloorToDelete(null);
    };

    return (
        <div className="space-y-6 ">
            <div className="space-y-4 mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Все этажи
                </h1>
                <AddFloorModal onCreated={handleFloorCreated} />
            </div>

            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Список этажей
                        </h2>
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
                                    Этаж
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Статус
                                </TableHead>
                                <TableHead className="text-maintx text-center">
                                    Кол-во комнат
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
                                        colSpan={5}
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
                            ) : floors.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        Этажи не найдены
                                    </TableCell>
                                </TableRow>
                            ) : (
                                floors.map((floor,idx) => (
                                    <TableRow
                                        key={floor.floor_id}
                                        className="border-dashed border-gray-200 hover:bg-gray-50"
                                    >
                                        <TableCell className="text-gray-700 font-medium text-center">
                                            {floor.floor_number}
                                        </TableCell>
                                        <TableCell className="text-gray-700 font-medium text-center">
                                            {idx+1}
                                        </TableCell>
                                        <TableCell className="text-center flex justify-center items-center">
                                            <Badge
                                                variant={
                                                    floor.is_active === 1
                                                        ? "success"
                                                        : "warning"
                                                }
                                                className="max-w-[110px] "
                                            >
                                                {floor.is_active_text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-700 text-center">
                                            {floor.rooms_count}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm text-center">
                                            {formatDateTime(floor.created_at)}
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
                                                                floor.floor_id
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
                                                                id: floor.floor_id,
                                                                number: floor.floor_number,
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

            <EditFloorModal
                floorId={editFloorId}
                isOpen={isEditOpen}
                onClose={handleCloseEdit}
                onUpdated={handleFloorUpdated}
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
                        Вы уверены, что хотите удалить этаж{" "}
                        <span className="font-semibold text-gray-900">
                            {floorToDelete?.number}
                        </span>{" "}
                        ? Это действие нельзя отменить.
                    </p>
                </div>
            </CustomModal>
        </div>
    );
};

export default FloorsPage;
