// 개발 시에는 상대 경로(/api) 사용 → Vite 프록시가 백엔드로 전달. 프로덕션에서는 VITE_API_BASE_URL 사용.
const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export type ImageType = 'PROFILE' | 'PROJECT';

export type GetPresignedUrlBody = {
  imageType: ImageType;
  fileName: string;
};

export type GetPresignedUrlResult = {
  imageId: number;
  presignedUrl: string;
  imageUrl: string;
};

export async function getPresignedUrl(
  body: GetPresignedUrlBody,
  token: string,
): Promise<GetPresignedUrlResult> {
  const res = await fetch(`${BASE_URL}/api/v1/images/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const json = (() => {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  })();
  if (!res.ok) {
    const message = json?.message ?? json?.error ?? `Presigned URL 요청 실패 (${res.status})`;
    const responseBody =
      json != null ? JSON.stringify(json, null, 2) : (text || '(응답 본문 없음)');
    const fullMessage = `[${res.status}] ${message}\n\n[Response Body]\n${responseBody}`;
    throw new Error(fullMessage);
  }

  const result = json?.result ?? json;
  return {
    imageId: result.imageId,
    presignedUrl: result.presignedUrl,
    imageUrl: result.imageUrl,
  };
}

export async function confirmImage(imageId: number, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/images/confirm/${imageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  const json = (() => {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  })();
  if (!res.ok) {
    const message = json?.message ?? json?.error ?? `이미지 업로드 확인 실패 (${res.status})`;
    const responseBody =
      json != null ? JSON.stringify(json, null, 2) : (text || '(응답 본문 없음)');
    const fullMessage = `[${res.status}] ${message}\n\n[Response Body]\n${responseBody}`;
    throw new Error(fullMessage);
  }
}
