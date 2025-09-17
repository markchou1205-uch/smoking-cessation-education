// utils/validation.ts - 表單驗證
export const validationRules = {
  studentId: {
    required: true,
    pattern: /^\d{7,10}$/,
    message: '學號格式不正確'
  },
  phone: {
    required: true,
    pattern: /^09\d{8}$/,
    message: '手機號碼格式不正確'
  },
  name: {
    required: true,
    minLength: 2,
    message: '姓名至少需要2個字'
  }
};

export function validateForm(data: any, rules: any) {
  const errors: { [key: string]: string } = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} 為必填欄位`;
      return;
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message;
      return;
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = rule.message;
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 
