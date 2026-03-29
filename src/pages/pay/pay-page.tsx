const PayPage = () => {
  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-8">
      <h1 className="Heading2 font-semibold text-[var(--ui-1000)]">결제하기</h1>
      <div className="rounded-2xl border border-[var(--ui-200)] bg-[var(--ui-bg)] p-6">
        <p className="Body1 text-[var(--ui-700)]">
          결제 페이지 기본 화면입니다. 결제 연동 전까지 이 화면으로 이동됩니다.
        </p>
      </div>
    </section>
  );
};

export default PayPage;
