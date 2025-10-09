import mongoose from "mongoose";

export interface IVaultItem extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  username: string;
  encryptedPassword: string;
  url: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const vaultItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  username: {
    type: String,
    trim: true,
  },
  encryptedPassword: {
    type: String,
    required: [true, "Password is required"],
  },
  url: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

vaultItemSchema.index({ userId: 1 });

export default mongoose.models.VaultItem || mongoose.model('VaultItem', vaultItemSchema);
