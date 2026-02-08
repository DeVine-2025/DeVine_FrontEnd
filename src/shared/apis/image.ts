type PresignedUrlResult = {
  imageId: number;
  presignedUrl: string;
  imageUrl: string;
};

type PresignedUrlResponse = {
  isSuccess: boolean;
  result?: PresignedUrlResult;
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
  const res = await fetch('https://api.devine.kr/api/v1/images/presigned-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`presigned-url failed: ${res.status}`);
  }

  const data = (await res.json()) as PresignedUrlResponse;
  if (!data.result) {
    throw new Error('presigned-url missing result');
  }

  return data.result;
}

export async function confirmImageUpload(imageId: number, token?: string) {
  const res = await fetch(`https://api.devine.kr/api/v1/images/confirm/${imageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`confirm image failed: ${res.status}`);
  }

  const data = (await res.json()) as ConfirmImageResponse;
  return data.result;
}
