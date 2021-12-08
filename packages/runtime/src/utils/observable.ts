export class Observable {
  private _subscribeAction: Function

  constructor(subscribeAction: Function) {
    this._subscribeAction = subscribeAction
  }

  subscribe(oOrOnNext: any, onError?: Function, onCompleted?: Function) {
    const observer = new Observer(oOrOnNext, onError, onCompleted)
    const result = this._subscribeAction(observer) // 开始发射数据并拿到subscribeAction的返回值
    return new Subscription(observer, result) // 创造控制observer和subscribeAction的实例对象
  }
}

export class Observer {
  private _isStopped = false
  private _onNext?: Function
  private _onError: Function
  private _onCompleted: Function

  constructor(onNext: any, onError?: Function, onCompleted?: Function) {
    if (typeof onNext === 'object') {
      this._onNext = onNext.next
      this._onError = onNext.error
      this._onCompleted = onNext.complete
    } else {
      this._onNext = onNext
      this._onError = onError as Function
      this._onCompleted = onCompleted as Function
    }
  }

  get isStopped() {
    return this._isStopped
  }

  next(value: any) {
    if (!this.isStopped && this._onNext) {
      this._onNext(value)
    }
  }

  stop() {
    this._isStopped = true
  }

  error(err: any) {
    if (!this.isStopped && this._onError) {
      this._isStopped = true
      this._onError(err)
    }
  }

  complete(res: any) {
    if (!this.isStopped && this._onCompleted) {
      this._isStopped = true
      this._onCompleted(res)
    }
  }
}

export class Subscription {
  private _observer: Observer
  private _result: Function

  constructor(observer: Observer, result: Function) {
    this._observer = observer
    this._result = result
  }

  unsubscribe() {
    this._observer.stop()
    this._result()
  }
}
