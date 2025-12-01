import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    EditRoomFormData,
    fetchRoomData,
    fetchFloors,
    validateForm,
    updateRoom,
    Floor,
} from "./data";
import CustomModal from "@/components/ui/custom-modal";
import { CustomInput, CustomCombobox } from "@/components/ui/custom-form";

interface EditRoomModalProps {
    roomId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
    roomId,
    isOpen,
    onClose,
    onUpdated,
}) => {
    const [formData, setFormData] = useState<EditRoomFormData>({
        floor_id: "",
        room_number: "",
        room_type: "",
        is_active: "1",
    });
    const [floors, setFloors] = useState<Floor[]>([]);

    useEffect(() => {
        const loadFloors = async () => {
            const floorsData = await fetchFloors();
            setFloors(floorsData);
        };
        loadFloors();
    }, []);

    useEffect(() => {
        const loadRoomData = async () => {
            if (!roomId || !isOpen) return;

            try {
                const roomData = await fetchRoomData(roomId.toString());
                if (roomData) {
                    setFormData({
                        floor_id: roomData.floor_id.toString(),
                        room_number: roomData.room_number.toString(),
                        room_type: roomData.room_type.toString(),
                        is_active: roomData.is_active.toString(),
                    });
                }
            } catch (error) {
                console.error("Error loading room data:", error);
            }
        };

        loadRoomData();
    }, [roomId, isOpen]);

    const handleFloorChange = (value: string) => {
        setFormData({ ...formData, floor_id: value });
    };

    const handleRoomNumberChange = (value: string) => {
        const numericValue = value.replace(/\D/g, "");
        setFormData({ ...formData, room_number: numericValue });
    };

    const handleRoomTypeChange = (value: string) => {
        setFormData({ ...formData, room_type: value });
    };

    const floorOptions = floors.map((floor) => ({
        value: floor.floor_id.toString(),
        label: `Этаж ${floor.floor_number}`,
    }));

    const roomTypeOptions = [
        { value: "1", label: "Восьмиместный" },
        { value: "2", label: "Четырехместный" },
        { value: "3", label: "Двухместный" },
        { value: "4", label: "Одноместный" },
    ];

    const handleIsActiveChange = (checked: boolean) => {
        setFormData({ ...formData, is_active: checked ? "1" : "0" });
    };

    const handleConfirm = async () => {
        if (!roomId || !validateForm(formData)) return;
        await updateRoom(roomId.toString(), formData);
        onUpdated();
        onClose();
    };

    return (
        <CustomModal
            title="Редактировать комнату"
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            showTrigger={false}
            confirmText="Сохранить"
            cancelText="Отмена"
            confirmBg="bg-black"
            confirmBgHover="bg-black/80"
            confirmDisabled={!validateForm(formData)}
            onConfirm={handleConfirm}
            onCancel={onClose}
            size="sm"
        >
            <div className="space-y-4 mt-2">
                <CustomCombobox
                    label="Этаж"
                    placeholder="Выберите этаж"
                    value={formData.floor_id}
                    onChange={handleFloorChange}
                    options={floorOptions}
                    required
                />
                <CustomInput
                    label="Номер комнаты"
                    placeholder="Например: 101"
                    value={formData.room_number}
                    onChange={handleRoomNumberChange}
                    type="text"
                    required
                />
                <CustomCombobox
                    label="Тип комнаты"
                    placeholder="Выберите тип"
                    value={formData.room_type}
                    onChange={handleRoomTypeChange}
                    options={roomTypeOptions}
                    required
                />
                <div className="flex items-center justify-between space-y-0 space-x-2">
                    <Label htmlFor="is_active" className="text-sm font-medium">
                        Статус
                    </Label>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {formData.is_active === "1"
                                ? "Активный"
                                : "Неактивный"}
                        </span>
                        <Switch
                            id="is_active"
                            checked={formData.is_active === "1"}
                            onCheckedChange={handleIsActiveChange}
                        />
                    </div>
                </div>
            </div>
        </CustomModal>
    );
};

export default EditRoomModal;
