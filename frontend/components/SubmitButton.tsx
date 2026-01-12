'use client'

export function SubmitButton() {
    const handleClick = () => {
        alert('提交');
    };

    return <button onClick={handleClick}>提交</button>;
}
