
export default function TextBlock({ content }) {
    return (
        <div className="text-center py-8 max-w-2xl mx-auto px-6">

            <h1
                className="mx-auto max-w-fit text-center tracking-widest text-neutral-700 "
                {...content?.$?.headline}
            >
                {content?.headline}
            </h1>
            <p className="mx-5 mt-8 text-center whitespace-pre-wrap leading-8 text-neutral-700"
                {...content?.$?.body}>
                {content?.body}
            </p>
        </div>
    );
}
