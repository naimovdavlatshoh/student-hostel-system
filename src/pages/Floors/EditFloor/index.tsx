import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    EditFloorFormData,
    fetchFloorData,
    validateForm,
    updateFloor,
} from "./data";
import CustomModal from "@/components/ui/custom-modal";

interface EditFloorModalProps {
    floorId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const EditFloorModal: React.FC<EditFloorModalProps> = ({
    floorId,
    isOpen,
    onClose,
    onUpdated,
}) => {
    const [formData, setFormData] = useState<EditFloorFormData>({
        floor_number: "",
        is_active: "1",
    });

    useEffect(() => {
        const loadFloorData = async () => {
            if (!floorId || !isOpen) return;

            try {
                const floorData = await fetchFloorData(floorId.toString());
                if (floorData) {
                    setFormData({
                        floor_number: floorData.floor_number.toString(),
                        is_active: floorData.is_active.toString(),
                    });
                }
            } catch (error) {
                console.error("Error loading floor data:", error);
            } finally {
                console.log("floorData");
            }
        };

        loadFloorData();
    }, [floorId, isOpen]);

    const handleFloorNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value.replace(/\D/g, "");
        setFormData({ ...formData, floor_number: value });
    };

    const handleIsActiveChange = (checked: boolean) => {
        setFormData({ ...formData, is_active: checked ? "1" : "0" });
    };

    const handleConfirm = async () => {
        if (!floorId || !validateForm(formData)) return;
        await updateFloor(floorId.toString(), formData);
        onUpdated();
        onClose();
    };

    return (
        <CustomModal
            title="Редактировать этаж"
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
                <div className="space-y-2">
                    <Label htmlFor="floor_number">Номер этажа</Label>
                    <Input
                        id="floor_number"
                        value={formData.floor_number}
                        onChange={handleFloorNumberChange}
                        placeholder="Например: 1"
                        maxLength={2}
                    />
                </div>
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

export default EditFloorModal;
