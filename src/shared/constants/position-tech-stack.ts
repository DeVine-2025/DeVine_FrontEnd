import JavascriptOff from '@assets/stackBadge/Category=Javascript, Status=Off.svg';
import JavascriptOn from '@assets/stackBadge/Category=Javascript, Status=On.svg';
import FlutterOff from '@assets/stackBadge/Category=Flutter, Status=Off.svg';
import FlutterOn from '@assets/stackBadge/Category=Flutter, Status=On.svg';
import COff from '@assets/stackBadge/Category=C, Status=Off.svg';
import COn from '@assets/stackBadge/Category=C, Status=On.svg';
import DjangoOff from '@assets/stackBadge/Category=Django, Status=Off.svg';
import DjangoOn from '@assets/stackBadge/Category=Django, Status=On.svg';
import ExpressOff from '@assets/stackBadge/Category=Express, Status=Off.svg';
import ExpressOn from '@assets/stackBadge/Category=Express, Status=On.svg';
import GoOff from '@assets/stackBadge/Category=Go, Status=Off.svg';
import GoOn from '@assets/stackBadge/Category=Go, Status=On.svg';
import JavaOff from '@assets/stackBadge/Category=Java, Status=Off.svg';
import JavaOn from '@assets/stackBadge/Category=Java, Status=On.svg';
import KotlinOff from '@assets/stackBadge/Category=Kotlin, Status=Off.svg';
import KotlinOn from '@assets/stackBadge/Category=Kotlin, Status=On.svg';
import MongodbOff from '@assets/stackBadge/Category=Mongodb, Status=Off.svg';
import MongodbOn from '@assets/stackBadge/Category=Mongodb, Status=On.svg';
import NestjsOff from '@assets/stackBadge/Category=Nestjs, Status=Off.svg';
import NestjsOn from '@assets/stackBadge/Category=Nestjs, Status=On.svg';
import NextjsOff from '@assets/stackBadge/Category=Nextjs, Status=Off.svg';
import NextjsOn from '@assets/stackBadge/Category=Nextjs, Status=On.svg';
import NodejsOff from '@assets/stackBadge/Category=Nodejs, Status=Off.svg';
import NodejsOn from '@assets/stackBadge/Category=Nodejs, Status=On.svg';
import MysqlOff from '@assets/stackBadge/Category=Mysql, Status=Off.svg';
import MysqlOn from '@assets/stackBadge/Category=Mysql, Status=On.svg';
import PhpOff from '@assets/stackBadge/Category=Php, Status=Off.svg';
import PhpOn from '@assets/stackBadge/Category=Php, Status=On.svg';
import PythonOff from '@assets/stackBadge/Category=Python, Status=Off.svg';
import PythonOn from '@assets/stackBadge/Category=Python, Status=On.svg';
import ReactOff from '@assets/stackBadge/Category=React, Status=Off.svg';
import ReactOn from '@assets/stackBadge/Category=React, Status=On.svg';
import ReactnativeOff from '@assets/stackBadge/Category=Reactnative, Status=Off.svg';
import ReactnativeOn from '@assets/stackBadge/Category=Reactnative, Status=On.svg';
import SpringOff from '@assets/stackBadge/Category=Spring, Status=Off.svg';
import SpringOn from '@assets/stackBadge/Category=Spring, Status=On.svg';
import SvelteOff from '@assets/stackBadge/Category=Svelte, Status=Off.svg';
import SvelteOn from '@assets/stackBadge/Category=Svelte, Status=On.svg';
import SwiftOff from '@assets/stackBadge/Category=Swift, Status=Off.svg';
import SwiftOn from '@assets/stackBadge/Category=Swift, Status=On.svg';
import TypescriptOff from '@assets/stackBadge/Category=Typescript, Status=Off.svg';
import TypescriptOn from '@assets/stackBadge/Category=Typescript, Status=On.svg';
import VuejsOff from '@assets/stackBadge/Category=Vuejs, Status=Off.svg';
import VuejsOn from '@assets/stackBadge/Category=Vuejs, Status=On.svg';
import AwsOff from '@assets/stackBadge/Property 1=Aws, Status=Off.svg';
import AwsOn from '@assets/stackBadge/Property 1=Aws, Status=On.svg';
import DockerOff from '@assets/stackBadge/Property 1=Docker, Status=Off.svg';
import DockerOn from '@assets/stackBadge/Property 1=Docker, Status=On.svg';
import FirebaseOff from '@assets/stackBadge/Property 1=Firebase, Status=Off.svg';
import FirebaseOn from '@assets/stackBadge/Property 1=Firebase, Status=On.svg';
import KubernetesOff from '@assets/stackBadge/Property 1=Kubernetes, Status=Off.svg';
import KubernetesOn from '@assets/stackBadge/Property 1=Kubernetes, Status=On.svg';
import InfraReactOff from '@assets/stackBadge/Property 1=React, Status=Off.svg';
import InfraReactOn from '@assets/stackBadge/Property 1=React, Status=On.svg';

export type TechStackChip =
  | { key: string; label: string; off: string; on: string }
  | { key: string; label: string };

export const FRONTEND_LANGUAGE_FRAMEWORK: TechStackChip[] = [
  { key: 'Javascript', label: 'Javascript', off: JavascriptOff, on: JavascriptOn },
  { key: 'Typescript', label: 'Typescript', off: TypescriptOff, on: TypescriptOn },
  { key: 'React', label: 'React', off: ReactOff, on: ReactOn },
  { key: 'Vuejs', label: 'Vuejs', off: VuejsOff, on: VuejsOn },
  { key: 'Nextjs', label: 'Nextjs', off: NextjsOff, on: NextjsOn },
  { key: 'Svelte', label: 'Svelte', off: SvelteOff, on: SvelteOn },
];

export const FRONTEND_MOBILE: TechStackChip[] = [
  { key: 'ReactNative', label: 'ReactNative', off: ReactnativeOff, on: ReactnativeOn },
  { key: 'Flutter', label: 'Flutter', off: FlutterOff, on: FlutterOn },
  { key: 'Kotlin', label: 'Kotlin', off: KotlinOff, on: KotlinOn },
  { key: 'Swift', label: 'Swift', off: SwiftOff, on: SwiftOn },
];

export const BACKEND_LANGUAGE: TechStackChip[] = [
  { key: 'Java', label: 'Java', off: JavaOff, on: JavaOn },
  { key: 'Python', label: 'Python', off: PythonOff, on: PythonOn },
  { key: 'Go', label: 'Go', off: GoOff, on: GoOn },
  { key: 'C', label: 'C', off: COff, on: COn },
  { key: 'Kotlin', label: 'Kotlin', off: KotlinOff, on: KotlinOn },
  { key: 'Php', label: 'Php', off: PhpOff, on: PhpOn },
];

export const BACKEND_FRAMEWORK: TechStackChip[] = [
  // 디자인은 Springboot이지만, 현재 에셋은 Spring으로 제공되어 임시로 매핑
  { key: 'Springboot', label: 'Springboot', off: SpringOff, on: SpringOn },
  { key: 'Nodejs', label: 'Nodejs', off: NodejsOff, on: NodejsOn },
  { key: 'Express', label: 'Express', off: ExpressOff, on: ExpressOn },
  { key: 'Nestjs', label: 'Nestjs', off: NestjsOff, on: NestjsOn },
  { key: 'Django', label: 'Django', off: DjangoOff, on: DjangoOn },
];

export const BACKEND_DATABASE: TechStackChip[] = [
  { key: 'MongoDB', label: 'MongoDB', off: MongodbOff, on: MongodbOn },
  { key: 'MySQL', label: 'MySQL', off: MysqlOff, on: MysqlOn },
];

export const INFRA_CLOUD: TechStackChip[] = [
  { key: 'AWS', label: 'AWS', off: AwsOff, on: AwsOn },
  { key: 'Firebase', label: 'Firebase', off: FirebaseOff, on: FirebaseOn },
  // 인프라 탭의 React는 별도 에셋(Property 1=React)을 사용
  { key: 'React', label: 'React', off: InfraReactOff, on: InfraReactOn },
];

export const INFRA_CONTAINER: TechStackChip[] = [
  { key: 'Docker', label: 'Docker', off: DockerOff, on: DockerOn },
  { key: 'Kubernetes', label: 'Kubernetes', off: KubernetesOff, on: KubernetesOn },
];

export const TECH_STACK_LABEL_BY_KEY: Record<string, string> = Object.fromEntries(
  [
    ...FRONTEND_LANGUAGE_FRAMEWORK,
    ...FRONTEND_MOBILE,
    ...BACKEND_LANGUAGE,
    ...BACKEND_FRAMEWORK,
    ...BACKEND_DATABASE,
    ...INFRA_CLOUD,
    ...INFRA_CONTAINER,
  ].map((c) => [c.key, c.label]),
);

export type PositionKey = 'frontend' | 'backend' | 'infra';

export function getKeysByPosition(position: PositionKey): string[] {
  return position === 'frontend'
    ? [...FRONTEND_LANGUAGE_FRAMEWORK, ...FRONTEND_MOBILE].map((b) => b.key)
    : position === 'backend'
      ? [...BACKEND_LANGUAGE, ...BACKEND_FRAMEWORK, ...BACKEND_DATABASE].map((b) => b.key)
      : [...INFRA_CLOUD, ...INFRA_CONTAINER].map((b) => b.key);
}

