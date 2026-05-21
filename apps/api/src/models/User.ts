import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// ─── Interface ──────────────────────────────────────────────
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "therapist" | "admin" | "patient";
  avatar?: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  fullName: string;
}

// ─── Schema ─────────────────────────────────────────────────
const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never return password by default
    },
    role: {
      type: String,
      enum: ["therapist", "admin", "patient"],
      default: "therapist",
    },
    avatar: String,
    phone: String,
    specialization: String,
    bio: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ───────────────────────────────────────────────
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ─── Pre-save Hook: Hash Password ──────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Methods ────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Indexes ────────────────────────────────────────────────
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
