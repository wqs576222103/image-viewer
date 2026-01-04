// 检测是否为移动端
export const isMobile = () => {
    // return window.innerWidth <= 768;
    // UA 判断
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}