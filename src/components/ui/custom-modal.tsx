import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CustomModalProps {
    trigger?: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showCloseButton?: boolean;
    showTrigger?: boolean;
    triggerText?: string;
    triggerVariant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
    showFooter?: boolean;
    footerContent?: React.ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmBg?: string;
    confirmBgHover?: string;
    confirmVariant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
    confirmDisabled?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
    className?: string;
    unstyled?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
    trigger,
    title,
    children,
    open,
    onOpenChange,
    showCloseButton = true,
    showTrigger = true,
    triggerText = "Open Modal",
    triggerVariant = "default",
    showFooter = true,
    footerContent,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "default",
    confirmBg = "bg-maintx",
    confirmBgHover = "bg-maintx/70",
    confirmDisabled = false,
    size = "md",
    width,
    height,
    maxWidth,
    maxHeight,
    className = "",
    unstyled = false,
}) => {
    // Support controlled and uncontrolled modes
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isControlled = open !== undefined;
    const actualOpen = isControlled ? !!open : internalOpen;

    const handleOpenChange = (nextOpen: boolean) => {
        if (isControlled) {
            onOpenChange?.(nextOpen);
        } else {
            setInternalOpen(nextOpen);
        }
    };
    const getSizeClass = () => {
        if (width || maxWidth) {
            return "";
        }
        switch (size) {
            case "sm":
                return "max-w-sm";
            case "md":
                return "max-w-md";
            case "lg":
                return "max-w-lg";
            case "xl":
                return "max-w-xl";
            default:
                return "max-w-md";
        }
    };

    const getModalStyles = () => {
        const styles: React.CSSProperties = {};

        if (width) {
            styles.width = width;
        }
        if (height) {
            styles.height = height;
        }
        if (maxWidth) {
            styles.maxWidth = maxWidth;
        }
        if (maxHeight) {
            styles.maxHeight = maxHeight;
        }

        return styles;
    };

    const handleConfirm = async () => {
        if (onConfirm) {
            setIsLoading(true);
            try {
                await onConfirm();
            } finally {
                setIsLoading(false);
            }
        }
        // Don't automatically close - let the onConfirm function handle closing
    };

    const handleCancel = () => {
        onCancel?.();
        handleOpenChange(false);
    };

    const modalContent = (
        <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
            {showTrigger && (
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant={triggerVariant}>{triggerText}</Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent
                className={`${getSizeClass()} ${className} ${
                    unstyled ? "bg-transparent shadow-none border-0 p-0" : ""
                }`}
                style={getModalStyles()}
                hideClose={!showCloseButton}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {!unstyled && (
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 ">
                            {title}
                        </DialogTitle>
                    </DialogHeader>
                )}

                <div className={unstyled ? "" : "py-4"}>{children}</div>

                {showFooter && !unstyled && (
                    <DialogFooter>
                        {footerContent || (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="text-gray-600  rounded-xl"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    className={`rounded-xl ${confirmBg} text-white duration-300 hover:${confirmBgHover}`}
                                    variant={confirmVariant}
                                    onClick={handleConfirm}
                                    disabled={isLoading || confirmDisabled}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Загрузка...</span>
                                        </div>
                                    ) : (
                                        confirmText
                                    )}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );

    return modalContent;
};

export default CustomModal;
