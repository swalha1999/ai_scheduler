import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrlForUpload } from '@/lib/storage/r2';

export async function POST(request: NextRequest) {
	const { fileName, fileType } = await request.json();

	const newFileName = `${fileName.split('.')[0]}_azmih_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileName.split('.').pop()}`;

	try {
		const signedUrl = await getSignedUrlForUpload(newFileName, fileType);
		return NextResponse.json({ signedUrl, key: newFileName });
	} catch (error) {
		return NextResponse.json({ error: 'Error generating signed URL' }, { status: 500 });
	}
}
