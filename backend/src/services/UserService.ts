import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IRoleRepository } from '../domain/repositories/IRoleRepository';
import { User, UserStatus } from '../domain/entities/User';
import { AppError, ErrorCode } from '../utils/AppError';
import { supabase } from '../config/supabase';

const { v4: uuidv4 }: { v4: () => string } = require('uuid');

export class UserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly roleRepo: IRoleRepository
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);
    return user;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const safeData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
    };
    
    return this.userRepo.update(userId, safeData);
  }

  async checkIsLastActiveAdmin(userId: string): Promise<boolean> {
    const userToMutate = await this.userRepo.findById(userId);
    if (!userToMutate || userToMutate.status !== UserStatus.ACTIVE) return false;

    const role = userToMutate.roleId ? await this.roleRepo.findById(userToMutate.roleId) : null;
    if (!role || role.name !== 'Admin') return false;

    const allUsers = await this.userRepo.findAll(UserStatus.ACTIVE);
    const activeAdmins = [];
    
    for (const u of allUsers) {
      if (u.roleId) {
        const uRole = await this.roleRepo.findById(u.roleId);
        if (uRole && uRole.name === 'Admin') {
          activeAdmins.push(u);
        }
      }
    }

    return activeAdmins.length <= 1;
  }

  async updateUserStatus(adminId: string, targetUserId: string, newStatus: UserStatus): Promise<User> {
    if (adminId === targetUserId && newStatus !== UserStatus.ACTIVE) {
      throw new AppError('Cannot deactivate or suspend your own administrative account.', 400, ErrorCode.VALIDATION_ERROR);
    }

    if (newStatus !== UserStatus.ACTIVE) {
      const isLastAdmin = await this.checkIsLastActiveAdmin(targetUserId);
      if (isLastAdmin) {
        throw new AppError('Cannot deactivate the last active Admin account.', 400, ErrorCode.VALIDATION_ERROR);
      }
    }

    return this.userRepo.update(targetUserId, { status: newStatus });
  }

  async updateUserRole(adminId: string, targetUserId: string, newRoleId: string): Promise<User> {
    if (adminId === targetUserId) {
      throw new AppError('Cannot modify your own administrator role.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const currentTarget = await this.userRepo.findById(targetUserId);
    const currentRole = currentTarget?.roleId ? await this.roleRepo.findById(currentTarget.roleId) : null;

    if (currentRole?.name === 'Admin') {
      const newRole = await this.roleRepo.findById(newRoleId);
      if (!newRole || newRole.name !== 'Admin') {
        const isLastAdmin = await this.checkIsLastActiveAdmin(targetUserId);
        if (isLastAdmin) {
          throw new AppError('Cannot demote the last active Admin account.', 400, ErrorCode.VALIDATION_ERROR);
        }
      }
    }

    return this.userRepo.update(targetUserId, { roleId: newRoleId });
  }

  async softDeleteUser(adminId: string, targetUserId: string): Promise<void> {
    if (adminId === targetUserId) {
      throw new AppError('Cannot delete your own administrative account.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const isLastAdmin = await this.checkIsLastActiveAdmin(targetUserId);
    if (isLastAdmin) {
      throw new AppError('Cannot delete the last active Admin account.', 400, ErrorCode.VALIDATION_ERROR);
    }

    await this.userRepo.delete(targetUserId, adminId);
  }

  async createUser(data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleName?: string;
    roleId?: string;
    status?: UserStatus;
  }): Promise<any> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError('A user with this email address already exists.', 409, ErrorCode.CONFLICT);
    }

    let role = null;
    if (data.roleId) {
      role = await this.roleRepo.findById(data.roleId);
    } else if (data.roleName) {
      role = await this.roleRepo.findByName(data.roleName);
    }
    if (!role) {
      role = await this.roleRepo.findByName('Staff');
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password || 'Welcome123!',
      email_confirm: true,
      user_metadata: {
        first_name: data.firstName || '',
        last_name: data.lastName || '',
      },
    });

    let newUserId: string;
    if (authError || !authData.user) {
      newUserId = uuidv4();
    } else {
      newUserId = authData.user.id;
    }

    await new Promise((res) => setTimeout(res, 200));
    let dbUser = await this.userRepo.findById(newUserId);
    if (!dbUser) {
      dbUser = await this.userRepo.create({
        id: newUserId,
        email: data.email,
        roleId: role ? role.id : null,
        status: data.status || UserStatus.ACTIVE,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phone: data.phone || null,
        avatarUrl: null,
        dateOfBirth: null,
        gender: null,
        address: null,
        city: null,
        state: null,
        country: null,
        postalCode: null,
        lastLoginAt: null,
        deletedAt: null,
        deletedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      dbUser = await this.userRepo.update(newUserId, {
        roleId: role ? role.id : dbUser.roleId,
        status: data.status || UserStatus.ACTIVE,
        firstName: data.firstName || dbUser.firstName,
        lastName: data.lastName || dbUser.lastName,
        phone: data.phone || dbUser.phone,
      });
    }

    const roleName = role ? role.name : 'Guest';
    return {
      ...dbUser,
      first_name: dbUser.firstName,
      last_name: dbUser.lastName,
      role_id: dbUser.roleId,
      role: { id: dbUser.roleId, name: roleName },
    };
  }

  async updateUser(adminId: string, targetUserId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleName?: string;
    roleId?: string;
    status?: UserStatus;
    password?: string;
  }): Promise<any> {
    if (data.roleId) {
      await this.updateUserRole(adminId, targetUserId, data.roleId);
    } else if (data.roleName) {
      const role = await this.roleRepo.findByName(data.roleName);
      if (role) {
        await this.updateUserRole(adminId, targetUserId, role.id);
      }
    }

    if (data.status) {
      await this.updateUserStatus(adminId, targetUserId, data.status);
    }

    if (data.password && data.password.trim() !== '') {
      try {
        await supabase.auth.admin.updateUserById(targetUserId, { password: data.password });
      } catch (e) {
        // Continue if Supabase auth update fails in local environment
      }
    }

    const updateFields: Partial<User> = {};
    if (data.firstName !== undefined) updateFields.firstName = data.firstName;
    if (data.lastName !== undefined) updateFields.lastName = data.lastName;
    if (data.phone !== undefined) updateFields.phone = data.phone;

    const updatedUser = await this.userRepo.update(targetUserId, updateFields);

    let roleName = 'Guest';
    if (updatedUser.roleId) {
      const roleObj = await this.roleRepo.findById(updatedUser.roleId);
      if (roleObj) roleName = roleObj.name;
    }

    return {
      ...updatedUser,
      first_name: updatedUser.firstName,
      last_name: updatedUser.lastName,
      role_id: updatedUser.roleId,
      role: { id: updatedUser.roleId, name: roleName },
    };
  }

  async getAllUsers(): Promise<any[]> {
    const users = await this.userRepo.findAll();
    const roles = await this.roleRepo.findAll();
    const roleMap: Record<string, string> = {};
    for (const r of roles) {
      roleMap[r.id] = r.name;
    }

    return users.map((user) => ({
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      role_id: user.roleId,
      role: {
        id: user.roleId,
        name: user.roleId && roleMap[user.roleId] ? roleMap[user.roleId] : 'Guest',
      },
    }));
  }
}

