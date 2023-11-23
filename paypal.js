import React, { useRef, useEffect, useState } from 'react';
import { View, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';
import { useAssets } from "expo-asset";
import { readAsStringAsync } from "expo-file-system";
import { useWindowDimensions } from 'react-native';

const PayPal = (props) => {
  const [loader, setLoader] = useState(true)
  const [assets, error] = useAssets([require('./paypal.html')])
  const webviewRef = useRef()
  let { width, height } = useWindowDimensions();
  const [renderedOnce, setRenderedOnce] = useState(false)
  const [dataFromWebView, setDataFromWebView] = useState()
  let js = `document.getElementById("p").innerHTML=${props?.amount}`
  const updateSource = () => {
    setRenderedOnce(true)
  }

  const onMessage = (data) => {
    setLoader(true)
    setDataFromWebView(data.nativeEvent.data);
    let d = JSON.parse(data.nativeEvent.data)
    if (d.status == "COMPLETED") {
      setTimeout(() => {
        setLoader(false)
        props?.onCapturePayment()
      }, 2000);
    } else {
      alert("Something went wrong!")
    }

  }

  const passValues = () => {
    webviewRef.current.postMessage(JSON.stringify({ amount: props?.amount }));
  }

  useEffect(() => {
    const interval = setTimeout(() => {
      setLoader(false)
    }, Platform.OS == "ios" ? 3000 : 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    props?.visible ?
      <View style={[styles.paypalCont, { width: width / 1.08, height: height / 2 }]}>
        <View style={styles.innerCont}>
          {loader && <View style={styles.loader}>
            <ActivityIndicator size="large" color="#fff" />
          </View>}
          <View style={{ flex: 1 }}>
            {
              assets !== undefined &&
              error === undefined &&
              assets[0].localUri !== null && (

                <WebView ref={webviewRef}
                  source={renderedOnce ? { uri: assets[0].localUri } : undefined}
                  scalesPageToFit={false}
                  useWebKit={Platform.OS == 'ios'}
                  onLoadEnd={() => passValues()}
                  allowFileAccess={true}
                  mixedContentMode="compatibility"
                  style={{ width: '100%', height: '100%' }}
                  onMessage={onMessage}
                  allowUniversalAccessFromFileURLs={true}
                  originWhitelist={['*']}
                  javaScriptEnabledAndroid={true}
                  javaScriptEnabled={true}
                  injectedJavaScript={js}
                  onLoad={updateSource}
                />
              )}
          </View>
        </View>
      </View>
      : <></>
  )
}

const styles = StyleSheet.create({
  loader: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
    opacity: 0.5,
    position: 'absolute',
    zIndex: 999999999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  paypalCont: {
    position: 'absolute',
    borderRadius: 10,
    // bottom: 0,
    backgroundColor: '#fff',

    zIndex: 99999999999999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  innerCont: {
    width: '100%',
    height: '100%',
    backgroundColor: 'red'
  }
})
export default PayPal