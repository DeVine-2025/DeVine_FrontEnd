export async function signupMember(payload: {
    agreements: { termsId: number; agreed: boolean }[];
    nickname: string;
    imageUrl?: string | null;
    mainType: 'PM' | 'DEVELOPER';
    categoryNames: string[];
    techstackNames: string[];
    body?: string | null;
    email?: string | null;
    linkedin?: string | null;
  }, token?: string) {
    const res = await fetch('https://api.devine.kr/api/v1/members/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) throw new Error(`signup failed: ${res.status}`);
    return res.json();
  }