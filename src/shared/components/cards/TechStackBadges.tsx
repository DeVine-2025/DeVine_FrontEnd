import react from '@assets/stackLogo/React.svg';
import './tech-stack-badges.css';
import reactNative from '@assets/stackLogo/Reactnative.svg';
import typescript from '@assets/stackLogo/Typescript.svg';
import node from '@assets/stackLogo/Nodejs.svg';
import python from '@assets/stackLogo/Python.svg';
import django from '@assets/stackLogo/Django.svg';
import next from '@assets/stackLogo/Nextjs.svg';
import spring from '@assets/stackLogo/Spring.svg';
import mysql from '@assets/stackLogo/Mysql.svg';
import firebase from '@assets/stackLogo/Firebase.svg';
import aws from '@assets/stackLogo/Aws.svg';
import java from '@assets/stackLogo/Java.svg';
import docker from '@assets/stackLogo/Docker.svg';
import javascript from '@assets/stackLogo/Javascript.svg';
import vue from '@assets/stackLogo/Vuejs.svg';
import flutter from '@assets/stackLogo/Flutter.svg';
import kotlin from '@assets/stackLogo/Kotlin.svg';
import swift from '@assets/stackLogo/Swift.svg';
import go from '@assets/stackLogo/Go.svg';
import c from '@assets/stackLogo/C.svg';
import php from '@assets/stackLogo/Php.svg';
import express from '@assets/stackLogo/Express.svg';
import nest from '@assets/stackLogo/Nestjs.svg';
import mongodb from '@assets/stackLogo/Mongodb.svg';
import svelte from '@assets/stackLogo/Svelte.svg';
import kubernetes from '@assets/stackLogo/Kubernetes.svg';

const logos: Record<string, string> = {
  react, reactnative: reactNative, typescript, nodejs: node, python, django,
  nextjs: next, spring, springboot: spring, mysql, firebase, aws,
  java, docker, javascript, js: javascript, vue, vuejs: vue,
  flutter, kotlin, swift, go, c, php, express, expressjs: express,
  nestjs: nest, mongodb, svelte, kubernetes,
};

export function ExploreTechIcon({ name, className }: { name: string; className?: string }) {
  const logo = logos[name.toLowerCase().replace(/[\s._-]/g, '')];
  return logo ? <img className={className} src={logo} alt="" aria-hidden="true" /> : null;
}

const displayNames: Record<string, string> = {
  javascript: 'JavaScript', js: 'JavaScript', typescript: 'TypeScript', react: 'React', reactnative: 'React Native',
  nextjs: 'Next.js', nodejs: 'Node.js', vue: 'Vue.js', vuejs: 'Vue.js', spring: 'Spring', springboot: 'Spring Boot',
  python: 'Python', django: 'Django', java: 'Java', mysql: 'MySQL', mongodb: 'MongoDB', aws: 'AWS',
  firebase: 'Firebase', docker: 'Docker', flutter: 'Flutter', kotlin: 'Kotlin', swift: 'Swift', go: 'Go',
  c: 'C', php: 'PHP', express: 'Express', expressjs: 'Express', nestjs: 'NestJS', svelte: 'Svelte', kubernetes: 'Kubernetes',
};

export function getTechDisplayName(name: string) {
  return displayNames[name.toLowerCase().replace(/[\s._-]/g, '')] ?? name;
}

export default function TechStackBadges({ stacks }: { stacks: string[] }) {
  return <div className="explore-tags">{stacks.map(name => {
    return <span className="explore-tech-badge" key={name}><ExploreTechIcon name={name} /><span>{getTechDisplayName(name)}</span></span>;
  })}</div>;
}
