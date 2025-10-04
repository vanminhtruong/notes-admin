import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NESTED_PERMISSIONS, type NestedPermission, getPermissionByKey } from '../interfaces/admin.types';

interface PermissionSelectorProps {
  selectedPermissions: string[];
  availablePermissions: string[];
  onChange: (permissions: string[]) => void;
  excludeManageAdmins?: boolean;
}

const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  selectedPermissions,
  availablePermissions,
  onChange,
  excludeManageAdmins = false
}) => {
  const { t } = useTranslation('admins');
  const [expandedPermissions, setExpandedPermissions] = useState<Set<string>>(new Set());

  const handlePermissionChange = (permission: string, checked: boolean) => {
    let newPermissions = [...selectedPermissions];
    
    if (checked) {
      // Thêm permission
      if (!newPermissions.includes(permission)) {
        newPermissions.push(permission);
      }
    } else {
      // Xóa permission
      newPermissions = newPermissions.filter(p => p !== permission);
      
      // Nếu là parent permission, xóa tất cả sub-permissions (recursive)
      const removeSubPermissions = (perms: NestedPermission[]) => {
        perms.forEach(sub => {
          newPermissions = newPermissions.filter(p => p !== sub.key);
          if (sub.subPermissions) {
            removeSubPermissions(sub.subPermissions);
          }
        });
      };
      
      const parentPerm = getPermissionByKey(permission);
      if (parentPerm?.subPermissions) {
        removeSubPermissions(parentPerm.subPermissions);
      }
    }
    
    onChange(newPermissions);
  };

  const handleSubPermissionChange = (subPermission: string, checked: boolean, parentKey: string) => {
    let newPermissions = [...selectedPermissions];
    
    if (checked) {
      // Tự động thêm quyền cha nếu chưa có
      if (!newPermissions.includes(parentKey)) {
        newPermissions.push(parentKey);
      }
      
      // Thêm quyền con
      if (!newPermissions.includes(subPermission)) {
        newPermissions.push(subPermission);
      }
    } else {
      // Bỏ tick quyền hiện tại
      newPermissions = newPermissions.filter(p => p !== subPermission);

      // Nếu quyền này có quyền con, cần bỏ tick tất cả descendants đệ quy
      const node = getPermissionByKey(subPermission);
      if (node?.subPermissions && node.subPermissions.length > 0) {
        const collectDescendantKeys = (perms: NestedPermission[]): string[] => {
          const acc: string[] = [];
          perms.forEach(sp => {
            acc.push(sp.key);
            if (sp.subPermissions && sp.subPermissions.length > 0) {
              acc.push(...collectDescendantKeys(sp.subPermissions));
            }
          });
          return acc;
        };

        const descendantKeys = collectDescendantKeys(node.subPermissions);
        if (descendantKeys.length > 0) {
          newPermissions = newPermissions.filter(p => !descendantKeys.includes(p));
        }
      }
    }
    
    onChange(newPermissions);
  };

  const toggleExpanded = (permission: string) => {
    setExpandedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permission)) {
        newSet.delete(permission);
      } else {
        newSet.add(permission);
      }
      return newSet;
    });
  };

  const getFilteredPermissions = () => {
    let permissions = NESTED_PERMISSIONS;
    if (excludeManageAdmins) {
      permissions = permissions.filter(p => p.key !== 'manage_admins');
    }

    // Returns true if this permission or any descendant exists in availablePermissions
    const hasAvailableDescendant = (perm: NestedPermission): boolean => {
      if (availablePermissions.includes(perm.key)) return true;
      if (!perm.subPermissions) return false;
      return perm.subPermissions.some(sp => hasAvailableDescendant(sp));
    };

    // Recursively filter out sub-permissions that are not available
    const filterTree = (perms: NestedPermission[]): NestedPermission[] => {
      return perms
        .filter(perm => hasAvailableDescendant(perm))
        .map(perm => ({
          ...perm,
          subPermissions: perm.subPermissions ? filterTree(perm.subPermissions) : undefined
        }));
    };

    return filterTree(permissions);
  };

  const isParentChecked = (parentKey: string, subPermissions?: NestedPermission[]) => {
    // Luôn ưu tiên check xem parent key có trong selectedPermissions không
    if (selectedPermissions.includes(parentKey)) return true;
    
    // Nếu không có subPermissions, chỉ dựa vào parent key
    if (!subPermissions) return false;
    
    // Parent cũng được check nếu có ít nhất 1 sub-permission được check (indeterminate state)
    return subPermissions.some(sub => selectedPermissions.includes(sub.key));
  };

  const isParentIndeterminate = (parentKey: string, subPermissions?: NestedPermission[]) => {
    // Nếu parent key đã được chọn trực tiếp, không indeterminate
    if (selectedPermissions.includes(parentKey)) return false;
    
    if (!subPermissions || subPermissions.length === 0) return false;
    const checkedSubPerms = subPermissions.filter(sub => selectedPermissions.includes(sub.key));
    return checkedSubPerms.length > 0 && checkedSubPerms.length < subPermissions.length;
  };

  // Render sub-permission with support for nested sub-permissions
  const renderSubPermission = (subPerm: NestedPermission, depth: number, parentKey: string, isParentChecked: boolean) => {
    const isSubChecked = selectedPermissions.includes(subPerm.key);
    const isSubExpanded = expandedPermissions.has(subPerm.key);
    const hasNestedSubs = subPerm.subPermissions && subPerm.subPermissions.length > 0;
    
    // Use defaultValue fallback to avoid showing raw keys
    const subLabel = t(`permissions.${subPerm.key}.label`, { defaultValue: subPerm.label });
    const subDescription = t(`permissions.${subPerm.key}.description`, { defaultValue: subPerm.description });
    
    return (
      <div key={subPerm.key} className={`ml-${depth * 4 + 4}`}>
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSubChecked}
            disabled={!isParentChecked}
            onChange={(e) => handleSubPermissionChange(subPerm.key, e.target.checked, parentKey)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex-1">
            <label className={`cursor-pointer ${!isParentChecked ? 'opacity-50' : ''}`}>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {subLabel}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subDescription}
              </div>
            </label>
          </div>
          {/* Hiển thị mũi tên khi có quyền con */}
          {hasNestedSubs && (
            <button
              type="button"
              onClick={() => toggleExpanded(subPerm.key)}
              className="mt-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className={`w-3 h-3 transform transition-transform ${
                  isSubExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Nested sub-sub-permissions - hiển thị khi expanded */}
        {hasNestedSubs && isSubExpanded && (
          <div className="mt-2 ml-4 space-y-2 border-l-2 border-gray-200 dark:border-neutral-600 pl-3">
            {subPerm.subPermissions!.map(nestedSub => 
              renderSubPermission(nestedSub, depth + 1, parentKey, isSubChecked)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {getFilteredPermissions().map(permission => {
        const isChecked = isParentChecked(permission.key, permission.subPermissions);
        const isIndeterminate = isParentIndeterminate(permission.key, permission.subPermissions);
        const isExpanded = expandedPermissions.has(permission.key);
        const hasSubPermissions = permission.subPermissions && permission.subPermissions.length > 0;
        const label = t(`permissions.${permission.key}.label`, { defaultValue: permission.label });
        const description = t(`permissions.${permission.key}.description`, { defaultValue: permission.description });
        
        return (
          <div key={permission.key} className="border border-gray-200 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800">
            <div className="p-3">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700"
                />
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {description}
                    </div>
                  </label>
                </div>
                {/* Hiển thị mũi tên khi có quyền con */}
                {hasSubPermissions && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(permission.key)}
                    className="mt-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Sub-permissions - hiển thị khi expanded */}
            {hasSubPermissions && isExpanded && (
              <div className="border-t border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700/50">
                <div className="p-3 space-y-2">
                  {permission.subPermissions!.map(subPerm => 
                    renderSubPermission(subPerm, 0, permission.key, isChecked)
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PermissionSelector;
