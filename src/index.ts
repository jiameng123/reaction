const a:string = "b";



interface IB {
    getA:() => void
}
export default class BB implements IB {
    getA() {
        console.log(1)
    }
}