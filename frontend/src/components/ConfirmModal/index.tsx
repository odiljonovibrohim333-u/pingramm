import Modal from '../Modal';
import Button from '../Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  danger?: boolean;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Tasdiqlash',
  cancelLabel = 'Bekor qilish',
  isLoading = false,
  danger = false,
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex gap-2">
        <Button
          onClick={onConfirm}
          variant={danger ? 'danger' : 'primary'}
          isLoading={isLoading}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
        <Button
          onClick={onClose}
          variant="secondary"
          disabled={isLoading}
          className="flex-1"
        >
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
