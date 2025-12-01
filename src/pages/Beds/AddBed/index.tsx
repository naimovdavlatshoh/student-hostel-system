import React, { useState, useEffect } from "react";
import { BedFormData, isBedFormValid, createBed } from "./data";
import { fetchRooms, Room } from "../Beds/data";
import CustomModal from "@/components/ui/custom-modal";
import { CustomInput, CustomCombobox } from "@/components/ui/custom-form";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";

interface AddBedModalProps {
    onCreated: () => void;
}

const AddBedModal: React.FC<AddBedModalProps> = ({ onCreated }) => {
    const [formData, setFormData] = useState<BedFormData>({
        room_id: "",
        bed_number: "",
        bed_type: "",
    });
    const [isOpen, setIsOpen] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        const loadRooms = async () => {
            const roomsData = await fetchRooms();
            setRooms(roomsData);
        };
        loadRooms();
    }, []);

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

    const handleConfirm = async () => {
        if (!isBedFormValid(formData)) return;
        await createBed(formData);
        setFormData({ room_id: "", bed_number: "", bed_type: "" });
        onCreated();
        setIsOpen(false);
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
            title="Добавить койку"
            showTrigger={true}
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={
                <Button className="bg-black text-white hover:bg-black/80 rounded-xl">
                    <IoMdAdd className="w-3 h-3" /> Добавить койку
                </Button>
            }
            confirmText="Сохранить"
            cancelText="Отмена"
            confirmBg="bg-black"
            confirmBgHover="bg-black/80"
            confirmDisabled={!isBedFormValid(formData)}
            onConfirm={handleConfirm}
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
            </div>
        </CustomModal>
    );
};

export default AddBedModal;
