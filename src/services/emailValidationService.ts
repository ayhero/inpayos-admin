import { api, ApiResponse } from './api';

export interface CheckEmailRequest {
  email: string;
}



class EmailValidationService {
  /**
   * 检查邮箱是否可用（未被使用）
   * @param email 邮箱地址
   * @returns 邮箱可用性检查结果
   */
  async checkEmailAvailability(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post<any>('/user/check-email', {
        email: email.trim()
      });
      
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data
      };
    } catch (error: any) {
      console.error('检查邮箱可用性失败:', error);
      return {
        success: false,
        code: 'ERROR',
        msg: error.message || '检查邮箱可用性失败',
        data: null
      };
    }
  }

  /**
   * 根据错误码生成用户友好的消息
   * @param code 错误码
   * @returns 用户友好的消息
   */
  private getMessageByCode(code: string): string {
    // 只返回统一的消息：邮箱已注册
    return '邮箱已注册';
  }

  /**
   * 客户端邮箱格式验证
   * @param email 邮箱地址
   * @returns 是否为有效的邮箱格式
   */
  validateEmailFormat(email: string): boolean {
    if (!email || email.trim().length === 0) {
      return false;
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  /**
   * 综合邮箱验证（格式 + 可用性）
   * @param email 邮箱地址
   * @returns 验证结果
   */
  async validateEmail(email: string): Promise<{
    valid: boolean;
    available: boolean;
    message: string;
  }> {
    // 首先检查格式
    if (!this.validateEmailFormat(email)) {
      return {
        valid: false,
        available: false,
        message: '邮箱格式错误'
      };
    }

    // 检查可用性
    try {
      const result = await this.checkEmailAvailability(email);
      
      if (!result.success) {
        return {
          valid: true,
          available: false,
          message: this.getMessageByCode(result.code)
        };
      }

      // API成功返回表示邮箱可用
      return {
        valid: true,
        available: true,
        message: '邮箱可用'
      };
    } catch (error) {
      return {
        valid: true,
        available: false,
        message: '网络错误'
      };
    }
  }
}

export const emailValidationService = new EmailValidationService();