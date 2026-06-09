import { type FormEvent, useState } from 'react';
import { ImageUp, Trash2, UserRound } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import type { WAAccount } from '../proto/byte/v/forge/waapp/v1/profile';
import { removeWaAccountProfilePicture, setWaAccountProfileName, setWaAccountProfilePicture } from './wa-api';
import { Badge, Button, Field, FieldDescription, FieldGroup, FieldLabel, Input } from './ui';

const maxProfilePictureBytes = 2 * 1024 * 1024;

type Props = {
  account: WAAccount;
  onDone: (message: string) => void;
  onError: (message: string) => void;
};

export function WaAccountProfileSettings({ account, onDone, onError }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [picture, setPicture] = useState<File | null>(null);
  const handleError = (error: unknown) => onError(error instanceof Error ? error.message : String(error));
  const nameMutation = useMutation({
    mutationFn: () => setWaAccountProfileName(account, displayName),
    onSuccess: () => { setDisplayName(''); onDone('资料名称请求已提交'); },
    onError: handleError,
  });
  const pictureMutation = useMutation({
    mutationFn: async () => {
      if (!picture) throw new Error('请选择头像图片');
      if (picture.size > maxProfilePictureBytes) throw new Error('头像图片不能超过 2 MiB');
      return setWaAccountProfilePicture(account, { image_base64: await fileBase64(picture), content_type: picture.type || 'application/octet-stream' });
    },
    onSuccess: (resp) => { setPicture(null); onDone(resp.profile_picture_id ? `头像已提交：${resp.profile_picture_id}` : '头像请求已提交'); },
    onError: handleError,
  });
  const removeMutation = useMutation({
    mutationFn: () => removeWaAccountProfilePicture(account),
    onSuccess: () => onDone('头像移除请求已提交'),
    onError: handleError,
  });
  const busy = nameMutation.isPending || pictureMutation.isPending || removeMutation.isPending;
  return (
    <section className="grid gap-3 rounded-xl border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1"><h3 className="inline-flex items-center gap-2 text-sm font-semibold"><UserRound size={15} />资料设置</h3><p className="text-xs text-muted-foreground">头像使用 WA profile-picture IQ；名称按 app-state 设置建模。</p></div>
        <Badge variant="outline">{busy ? '提交中' : '就绪'}</Badge>
      </div>
      <form className="rounded-xl border bg-card p-3" onSubmit={(event) => submit(event, nameMutation.mutate)}>
        <FieldGroup>
          <Field>
            <FieldLabel>资料名称</FieldLabel>
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={25} disabled={busy} placeholder="最多 25 个字符" />
          </Field>
          <FieldDescription>名称发送依赖 app-state mutation 管线；未启用时服务端会拒绝而不是伪造成功。</FieldDescription>
          <Button type="submit" disabled={busy || !displayName.trim()}><UserRound size={14} />提交名称</Button>
        </FieldGroup>
      </form>
      <form className="rounded-xl border bg-card p-3" onSubmit={(event) => submit(event, pictureMutation.mutate)}>
        <FieldGroup>
          <Field>
            <FieldLabel>头像图片</FieldLabel>
            <Input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => setPicture(event.target.files?.[0] || null)} />
          </Field>
          <FieldDescription>{picture ? `${picture.name} · ${formatBytes(picture.size)}` : '支持 JPEG、PNG、WebP，最大 2 MiB。'}</FieldDescription>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy || !picture}><ImageUp size={14} />提交头像</Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => removeMutation.mutate()}><Trash2 size={14} />移除头像</Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}

function submit(event: FormEvent<HTMLFormElement>, run: () => void) {
  event.preventDefault();
  run();
}

async function fileBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / 1024 / 1024).toFixed(1)} MiB`;
}
