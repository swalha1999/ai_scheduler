import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
	return (
		<div className="container mx-auto py-8">
			<div className="mb-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/" className="flex items-center gap-1">
						<ArrowRight className="h-4 w-4" />
						<span>العودة</span>
					</Link>
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold">الشروط والأحكام</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6 text-right">
					<div>
						<h2 className="mb-4 text-xl font-bold">
							الشروط المرافقة لشراء باقة عزيمة :
						</h2>
						<ol className="list-decimal space-y-2 pr-6">
							<li>
								يلتزم مستخدم خدمة عزيمة بجميع شروط الاستخدام والخصوصية الواردة في
								ملف شروط الاستخدام والخصوصية الخاص في الموقع.
							</li>
							<li>
								بنود اساسية للتذكير:-
								<ol className="list-[lower-alpha] space-y-2 pr-6">
									<li>
										يتم استخدام خدمة الموقع لإرسال بطاقات عزيمة لمناسبات خاصه
										فقط، ويمنع منعا باتاً استخدام الخدمة لأي غرض اخر، بما في ذلك
										لإرسال أي محتوى اعلاني.
									</li>
									<li>
										معلوم لمستخدم الموقع ان إدارة الموقع تقوم بمعاينة وفحص جميع
										الدعوات المرسلة بهدف الموافقة عليها قبل الارسال.
									</li>
								</ol>
							</li>
						</ol>
					</div>

					<div>
						<h2 className="mb-4 text-xl font-bold">
							الشروط المرافقة لشراء مساحة إعلان:
						</h2>
						<ol className="list-decimal space-y-2 pr-6">
							<li>
								يلتزم مستخدم خدمة الاعلان بجميع شروط الاستخدام والخصوصية الواردة في
								ملف شروط الاستخدام والخصوصية الخاص في الموقع.
							</li>
							<li>
								بنود اساسية للتذكير:-
								<ol className="list-[lower-alpha] space-y-2 pr-6">
									<li>
										معلوم لمستخدم الموقع ان إدارة الموقع تقوم بمعاينة وفحص جميع
										الإعلانات والمضامين الموضوعة في مساحة المعلن الخاصة بهدف
										الموافقة عليها قبل إعلانها على الموقع.
									</li>
								</ol>
							</li>
						</ol>
					</div>

					<div>
						<h2 className="mb-4 text-xl font-bold">
							الشروط المرافقة لإضافة ارقام على قوائم العزيمة:
						</h2>
						<ul className="list-disc space-y-2 pr-6">
							<li>
								أوافق على ارسال رسائل عزيمة على رقمي الخاص والذي قد قمت بوضعه على
								هذا الرابط.
							</li>
							<li>
								اعلم ان ارسال معلومات خاطئة بشكل مقصود او ارسال معلومات لأشخاص اخرين
								قد تعرضني للمحاسبة القانونية.
							</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
