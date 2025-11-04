import { useState } from 'react';

export interface UseAdminActionsStateReturn {
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  revoking: boolean;
  setCreating: (value: boolean) => void;
  setUpdating: (value: boolean) => void;
  setDeleting: (value: boolean) => void;
  setRevoking: (value: boolean) => void;
}

export const useAdminActionsState = (): UseAdminActionsStateReturn => {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [revoking, setRevoking] = useState(false);

  return {
    creating,
    updating,
    deleting,
    revoking,
    setCreating,
    setUpdating,
    setDeleting,
    setRevoking,
  };
};
