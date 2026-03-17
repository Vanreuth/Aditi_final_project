"use client";

import { User, Mail, Phone, MapPin, FileText, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const profileFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "ឈ្មោះអ្នកប្រើត្រូវមានយ៉ាងតិច 3 តួអក្សរ" })
    .max(50, { message: "ឈ្មោះអ្នកប្រើមិនអាចលើសពី 50 តួអក្សរ" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "ឈ្មោះអ្នកប្រើអាចមានតែអក្សរ លេខ និង underscore",
    }),
  phoneNumber: z
    .string()
    .trim()
    .max(32, { message: "លេខទូរស័ព្ទមិនអាចលើសពី 32 តួអក្សរ" })
    .regex(/^[0-9+()\-\s]*$/, {
      message: "លេខទូរស័ព្ទអាចមានតែលេខ សញ្ញា + ដកឃ្លា និងសញ្ញាវង់ក្រចក",
    }),
  address: z
    .string()
    .trim()
    .max(255, { message: "អាសយដ្ឋានមិនអាចលើសពី 255 តួអក្សរ" }),
  bio: z
    .string()
    .trim()
    .max(500, { message: "អំពីខ្ញុំមិនអាចលើសពី 500 តួអក្សរ" }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  form: UseFormReturn<ProfileFormValues>;
  isEditing: boolean;
  isLoading: boolean;
  hasPendingChanges: boolean;
  userEmail?: string;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
}

export function ProfileForm({
  form,
  isEditing,
  isLoading,
  hasPendingChanges,
  userEmail,
  onSubmit,
}: ProfileFormProps) {
  const fieldClass = !isEditing ? "bg-slate-50 dark:bg-slate-800/50" : "";
  const addressValue = form.watch("address") ?? "";
  const bioValue = form.watch("bio") ?? "";

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-violet-600" />
          ព័ត៌មានផ្ទាល់ខ្លួន
        </CardTitle>
        <CardDescription>គ្រប់គ្រងព័ត៌មានគណនីរបស់អ្នក</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email — read-only */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                អ៊ីមែល
              </div>
              <Input value={userEmail || ""} disabled className="bg-slate-50 dark:bg-slate-800/50" />
              <p className="text-xs text-muted-foreground">អ៊ីមែលមិនអាចផ្លាស់ប្ដូរបានទេ</p>
            </div>

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    ឈ្មោះអ្នកប្រើប្រាស់
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      disabled={!isEditing}
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>នេះជាឈ្មោះបង្ហាញជាសាធារណៈរបស់អ្នក</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    លេខទូរស័ព្ទ
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+855 12 345 678"
                      disabled={!isEditing}
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>លេខទូរស័ព្ទសម្រាប់ទំនាក់ទំនង</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    អាសយដ្ឋាន
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Phnom Penh, Cambodia"
                      disabled={!isEditing}
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{addressValue.length}/255 តួអក្សរ</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    អំពីខ្ញុំ
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ប្រាប់អំពីខ្លួនអ្នកបន្តិច..."
                      className={`resize-none ${fieldClass}`}
                      rows={4}
                      disabled={!isEditing}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{bioValue.length}/500 តួអក្សរ</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading || !hasPendingChanges} className="gap-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  រក្សាទុកការផ្លាស់ប្តូរ
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
