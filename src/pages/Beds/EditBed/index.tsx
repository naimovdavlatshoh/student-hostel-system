import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    EditBedFormData,
    fetchBedData,
    fetchRooms,
    validateForm,
    updateBed,
    Room,
} from "./data";
import CustomModal from "@/components/ui/custom-modal";
import { CustomInput, CustomCombobox } from "@/components/ui/custom-form";

interface EditBedModalProps {
    bedId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const EditBedModal: React.FC<EditBedModalProps> = ({
    bedId,
    isOpen,
    onClose,
    onUpdated,
}) => {
    const [formData, setFormData] = useState<EditBedFormData>({
        room_id: "",
        bed_number: "",
        bed_type: "",
        is_active: "1",
    });
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        const loadRooms = async () => {
            const roomsData = await fetchRooms();
            setRooms(roomsData);
        };
        loadRooms();
    }, []);

    useEffect(() => {
        const loadBedData = async () => {
            if (!bedId || !isOpen) return;

            try {
                const bedData = await fetchBedData(bedId.toString());
                if (bedData) {
                    setFormData({
                        room_id: bedData.room_id.toString(),
                        bed_number: bedData.bed_number.toString(),
                        bed_type: bedData.bed_type.toString(),
                        is_active: bedData.is_active.toString(),
                    });
                }
            } catch (error) {
                console.error("Error loading bed data:", error);
            }
        };

        loadBedData();
    }, [bedId, isOpen]);

    const handleRoomChange = (value: string) => {
        setFormData({ ...formData, room_id: value });
    };

    const handleBedNumberChange = (value: string) => {
        const numericValue = value.replace(/\D/g, "");
        setFormData({ ...formData, bed_number: numericValue });
    };

    const handleBedTypeChange = (value: string) => {
        setFormData({ ...formData, bed_type: value });
    };

    const handleIsActiveChange = (checked: boolean) => {
        setFormData({ ...formData, is_active: checked ? "1" : "0" });
    };

    const handleConfirm = async () => {
        if (!bedId || !validateForm(formData)) return;
        await updateBed(bedId.toString(), formData);
        onUpdated();
        onClose();
    };

    const roomOptions = rooms.map((room) => ({
        value: room.room_id.toString(),
        label: `Комната ${room.room_number} (Этаж ${room.floor_number})`,
    }));

    const bedTypeOptions = [
        { value: "1", label: "Нижняя койка" },
        { value: "2", label: "Верхняя койка" },
    ];

    return (
        <CustomModal
            title="Редактировать койку"
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
                    label="Комната"
                    placeholder="Выберите комнату"
                    value={formData.room_id}
                    onChange={handleRoomChange}
                    options={roomOptions}
                    required
                />
                <CustomInput
                    label="Номер койки"
                    placeholder="Например: 1"
                    value={formData.bed_number}
                    onChange={handleBedNumberChange}
                    type="text"
                    required
                />
                <CustomCombobox
                    label="Тип койки"
                    placeholder="Выберите тип"
                    value={formData.bed_type}
                    onChange={handleBedTypeChange}
                    options={bedTypeOptions}
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

export default EditBedModal;
