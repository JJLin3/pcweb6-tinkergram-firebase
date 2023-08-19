// import the library
import { library } from '@fortawesome/fontawesome-svg-core'

// import your icons
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./views/LoginPage";
import PostPageHome from "./views/PostPageHome";
import SignUpPage from "./views/SignUpPage";
import PostPageDetails from "./views/PostPageDetails";
import PostPageAdd from "./views/PostPageAdd";
import PostPageUpdate from "./views/PostPageUpdate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PostPageHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/add" element={<PostPageAdd />} />
        <Route path="/post/:id" element={<PostPageDetails />} />
        <Route path="/update/:id" element={<PostPageUpdate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

library.add(fas, far)
