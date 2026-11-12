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

function requestPresignedUrl(body: GetPresignedUrlBody, token?: string) {
  return fetch(`${BASE_URL}/api/v1/images/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function getPresignedUrl(
  body: GetPresignedUrlBody,
  token: string,
): Promise<GetPresignedUrlResult> {
  const res = await requestPresignedUrl(body, token);

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

function requestImageConfirmation(imageId: number, token?: string, imageUrl?: string) {
  return fetch(`${BASE_URL}/api/v1/images/confirm/${imageId}`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(imageUrl !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(imageUrl !== undefined ? { body: JSON.stringify({ imageUrl }) } : {}),
  });
}

async function confirmImage(imageId: number, token: string): Promise<void> {
  const res = await requestImageConfirmation(imageId, token);

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

type PresignedUrlResponse = {
  isSuccess: boolean;
  result?: GetPresignedUrlResult;
};

type ConfirmImageResponse = {
  isSuccess: boolean;
  result?: {
    imageId: number;
    imageUrl: string;
  };
};

export async function createPresignedUrl(
  payload: { imageType: 'PROFILE'; fileName: string },
  token?: string,
) {
  const res = await requestPresignedUrl(payload, token);

  if (!res.ok) {
    throw new Error(`presigned-url failed: ${res.status}`);
  }

  const data = (await res.json()) as PresignedUrlResponse;
  if (!data.result) {
    throw new Error('presigned-url missing result');
  }

  return data.result;
}

export async function confirmImageUpload(imageId: number, imageUrl: string, token?: string) {
  const res = await requestImageConfirmation(imageId, token, imageUrl);

  if (!res.ok) {
    throw new Error(`confirm image failed: ${res.status}`);
  }

  const data = (await res.json()) as ConfirmImageResponse;
  return data.result;
}

export async function uploadProjectImage(file: File, token: string) {
  const image = await getPresignedUrl({ imageType: 'PROJECT', fileName: file.name }, token);
  const response = await fetch(image.presignedUrl, {
    method: 'PUT',
    body: file,
    headers: file.type ? { 'Content-Type': file.type } : undefined,
  });
  if (!response.ok) {
    throw new Error(`이미지 업로드 실패 (${response.status})`);
  }
  await confirmImage(image.imageId, token);
  return image;
}
