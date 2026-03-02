import { ref, watch, type ShallowRef } from 'vue'

interface UseDialogReturn {
  openDialog: () => void
  closeDialog: () => void
}

export function useDialog(
  dialogRef: Readonly<ShallowRef<HTMLDialogElement | null>>,
  isOpen?: () => boolean,
): UseDialogReturn {
  const triggerElement = ref<Element | null>(null)

  function openDialog(): void {
    triggerElement.value = document.activeElement
    dialogRef.value?.showModal()
  }

  function closeDialog(): void {
    dialogRef.value?.close()
    if (triggerElement.value instanceof HTMLElement) {
      triggerElement.value.focus()
    }
    triggerElement.value = null
  }

  if (isOpen) {
    watch(isOpen, (open) => {
      if (open) {
        openDialog()
      } else {
        closeDialog()
      }
    })
  }

  return { openDialog, closeDialog }
}
