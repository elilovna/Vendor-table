import { ref, watch, type Ref } from 'vue'

interface UseDialogReturn {
  dialogRef: Ref<HTMLDialogElement | null>
  openDialog: () => void
  closeDialog: () => void
}

export function useDialog(isOpen?: () => boolean): UseDialogReturn {
  const dialogRef = ref<HTMLDialogElement | null>(null)
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

  return { dialogRef, openDialog, closeDialog }
}
