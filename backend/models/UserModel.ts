import bcrypt from 'bcryptjs';
import { AppUser, UserRole } from '../../shared/types';
import { pool } from '../db';

function mapRowToUser(row: any): AppUser {
  return {
    id: row.id,
    email: row.email,
    nom: row.nom,
    role: row.role,
    telephone: row.telephone || undefined,
    matricule: row.matricule || undefined,
  };
}

class UserModelClass {
  public async getAll(): Promise<AppUser[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY email');
    return result.rows.map(mapRowToUser);
  }

  // Utilisé uniquement en interne pour la vérification du mot de passe (contient le hash).
  public async findByEmailWithHash(email: string): Promise<(AppUser & { passwordHash: string }) | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { ...mapRowToUser(row), passwordHash: row.password_hash };
  }

  public async getById(id: string): Promise<AppUser | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return mapRowToUser(result.rows[0]);
  }

  public async update(
    id: string,
    updates: Partial<{
      email: string;
      nom: string;
      role: UserRole;
      telephone: string;
      matricule: string;
      password: string;
    }>
  ): Promise<AppUser | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const email = updates.email ?? existing.email;
    const nom = updates.nom ?? existing.nom;
    const role = updates.role ?? existing.role;
    const telephone = updates.telephone ?? existing.telephone ?? null;
    const matricule = updates.matricule ?? existing.matricule ?? null;

    if (updates.password) {
      const passwordHash = await bcrypt.hash(updates.password, 10);
      const result = await pool.query(
        `UPDATE users SET email = $1, nom = $2, role = $3, telephone = $4, matricule = $5, password_hash = $6
         WHERE id = $7 RETURNING *`,
        [email, nom, role, telephone, matricule, passwordHash, id]
      );
      return mapRowToUser(result.rows[0]);
    }

    const result = await pool.query(
      `UPDATE users SET email = $1, nom = $2, role = $3, telephone = $4, matricule = $5
       WHERE id = $6 RETURNING *`,
      [email, nom, role, telephone, matricule, id]
    );
    return mapRowToUser(result.rows[0]);
  }

  public async delete(id: string): Promise<AppUser | null> {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return null;
    return mapRowToUser(result.rows[0]);
  }

  private async generateNextId(): Promise<string> {
    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    let n = countResult.rows[0].count + 1;
    let candidate = `user-${String(n).padStart(3, '0')}`;

    while (true) {
      const exists = await pool.query('SELECT 1 FROM users WHERE id = $1', [candidate]);
      if (exists.rows.length === 0) break;
      n += 1;
      candidate = `user-${String(n).padStart(3, '0')}`;
    }

    return candidate;
  }

  public async create(data: {
    email: string;
    password: string;
    nom: string;
    role: UserRole;
    telephone?: string;
    matricule?: string;
  }): Promise<AppUser> {
    const id = await this.generateNextId();
    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, nom, role, telephone, matricule)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, data.email, passwordHash, data.nom, data.role, data.telephone || null, data.matricule || null]
    );

    return mapRowToUser(result.rows[0]);
  }

  public async verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}

export const UserModel = new UserModelClass();